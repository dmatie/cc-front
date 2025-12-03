import { StatusEnum, StatusMapper, StatusType } from "../../models/registration.model";

export function MapAccessRequestApiStatusToModel(apiStatus: StatusEnum): StatusType {
  return StatusMapper[apiStatus];
}

export function MapAccessRequestModelStatusToApi(modelStatus: StatusType): StatusEnum {
  const entry = Object.entries(StatusMapper)
    .find(([_, v]) => v === modelStatus);
  return entry ? Number(entry[0]) as StatusEnum : StatusEnum.Pending;
}

export function getCharCountClass(text: string | undefined, max: number): string {
  const length = text?.length || 0;
  if (length >= max) return 'text-danger fw-bold';
  if (length >= max * 0.9) return 'text-warning';
  return 'text-muted';
}

export interface FileIcon {
  iconClass: string;
  colorClass: string;
}

export function getFileIcon(fileName: string): FileIcon {
  const extension = fileName.toLowerCase().split('.').pop() || '';

  switch (extension) {
    case 'pdf':
      return { iconClass: 'bi-file-earmark-pdf', colorClass: 'text-danger' };
    case 'doc':
    case 'docx':
      return { iconClass: 'bi-file-earmark-word', colorClass: 'text-primary' };
    case 'xls':
    case 'xlsx':
      return { iconClass: 'bi-file-earmark-excel', colorClass: 'text-success' };
    case 'ppt':
    case 'pptx':
      return { iconClass: 'bi-file-earmark-ppt', colorClass: 'text-warning' };
    case 'zip':
    case 'rar':
    case '7z':
      return { iconClass: 'bi-file-earmark-zip', colorClass: 'text-secondary' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return { iconClass: 'bi-file-earmark-image', colorClass: 'text-info' };
    case 'txt':
      return { iconClass: 'bi-file-earmark-text', colorClass: 'text-muted' };
    default:
      return { iconClass: 'bi-file-earmark', colorClass: 'text-muted' };
  }
}
