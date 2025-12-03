#!/bin/sh
set -e

echo "🔍 Auto-extraction des hashes CSP depuis index.html"
echo "===================================================="

INDEX_FILE="${1:-/usr/share/nginx/html/index.html}"
NGINX_CONF="${2:-/etc/nginx/conf.d/default.conf}"

if [ ! -f "$INDEX_FILE" ]; then
    echo "❌ Erreur: $INDEX_FILE introuvable"
    exit 1
fi

if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Erreur: $NGINX_CONF introuvable"
    exit 1
fi

echo "📄 Lecture de: $INDEX_FILE"
echo "⚙️  Mise à jour de: $NGINX_CONF"
echo ""

HASHES=""

echo "🔎 Extraction des <script> inline (multilignes)..."
SCRIPT_COUNT=0

# Utiliser awk pour extraire les scripts multilignes
awk '
/<script[^>]*nonce[^>]*>/ {
    in_script = 1
    script_content = ""
    next
}
in_script {
    if (/<\/script>/) {
        in_script = 0
        if (script_content != "") {
            print script_content
        }
        script_content = ""
    } else {
        if (script_content != "") {
            script_content = script_content "\n" $0
        } else {
            script_content = $0
        }
    }
}
' "$INDEX_FILE" | while IFS= read -r CONTENT; do
    if [ -n "$CONTENT" ]; then
        SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
        HASH=$(printf "%s" "$CONTENT" | openssl dgst -sha256 -binary | openssl base64)
        echo "  ✓ Script $SCRIPT_COUNT: 'sha256-$HASH'"
        HASHES="$HASHES 'sha256-$HASH'"
    fi
done

# Capturer les hashes générés (car le while est dans un pipe)
HASHES=$(awk '
/<script[^>]*nonce[^>]*>/ {
    in_script = 1
    script_content = ""
    next
}
in_script {
    if (/<\/script>/) {
        in_script = 0
        if (script_content != "") {
            print script_content
        }
        script_content = ""
    } else {
        if (script_content != "") {
            script_content = script_content "\n" $0
        } else {
            script_content = $0
        }
    }
}
' "$INDEX_FILE" | while IFS= read -r CONTENT; do
    if [ -n "$CONTENT" ]; then
        HASH=$(printf "%s" "$CONTENT" | openssl dgst -sha256 -binary | openssl base64)
        printf " 'sha256-%s'" "$HASH"
    fi
done)

echo ""
echo "🔎 Extraction des event handlers (onload, onerror, etc.)..."
HANDLER_COUNT=0
for attr in onload onerror onclick onchange; do
    ATTR_CONTENT=$(grep -o "$attr=\"[^\"]*\"" "$INDEX_FILE" 2>/dev/null || true)

    if [ -n "$ATTR_CONTENT" ]; then
        echo "$ATTR_CONTENT" | while IFS= read -r handler; do
            HANDLER_COUNT=$((HANDLER_COUNT + 1))
            CONTENT=$(echo "$handler" | sed "s/$attr=\"\(.*\)\"/\1/")

            if [ -n "$CONTENT" ]; then
                HASH=$(printf "%s" "$CONTENT" | openssl dgst -sha256 -binary | openssl base64)
                echo "  ✓ Handler $HANDLER_COUNT ($attr): 'sha256-$HASH'"
            fi
        done
    fi
done

# Ajouter les hashes des event handlers
HANDLER_HASHES=$(for attr in onload onerror onclick onchange; do
    ATTR_CONTENT=$(grep -o "$attr=\"[^\"]*\"" "$INDEX_FILE" 2>/dev/null || true)

    if [ -n "$ATTR_CONTENT" ]; then
        echo "$ATTR_CONTENT" | while IFS= read -r handler; do
            CONTENT=$(echo "$handler" | sed "s/$attr=\"\(.*\)\"/\1/")

            if [ -n "$CONTENT" ]; then
                HASH=$(printf "%s" "$CONTENT" | openssl dgst -sha256 -binary | openssl base64)
                printf " 'sha256-%s'" "$HASH"
            fi
        done
    fi
done)

HASHES="$HASHES$HANDLER_HASHES"

# Supprimer les doublons et trier
HASHES=$(echo "$HASHES" | tr ' ' '\n' | grep -v '^$' | sort -u | tr '\n' ' ')

if [ -z "$HASHES" ]; then
    echo ""
    echo "⚠️  Aucun hash trouvé - aucune modification nécessaire"
    exit 0
fi

echo ""
echo "📝 Hashes collectés:"
for hash in $HASHES; do
    echo "   $hash"
done

echo ""
echo "🔧 Mise à jour de nginx.conf..."

# Trouver la ligne script-src et ajouter les hashes (en préservant les hashes existants)
if grep -q "script-src" "$NGINX_CONF"; then
    # Insérer les nouveaux hashes juste avant le point-virgule (préserve les hashes existants)
    sed -i.bak "s|script-src \([^;]*\);|script-src \1 $HASHES;|g" "$NGINX_CONF"
    echo "✅ nginx.conf mis à jour avec succès!"
else
    echo "❌ Erreur: Directive script-src introuvable"
    exit 1
fi

echo ""
echo "🔄 Nouvelle directive script-src:"
grep "script-src" "$NGINX_CONF" | head -n 1 | sed 's/^[[:space:]]*/   /'
echo ""
echo "✨ Configuration CSP prête!"
