import { StatusEnum, StatusMapper, StatusType } from "../../models/registration.model";

export function MapAccessRequestApiStatusToModel(apiStatus: StatusEnum): StatusType {
  return StatusMapper[apiStatus];
}

export function MapAccessRequestModelStatusToApi(modelStatus: StatusType): StatusEnum {
  const entry = Object.entries(StatusMapper)
    .find(([_, v]) => v === modelStatus);
  return entry ? Number(entry[0]) as StatusEnum : StatusEnum.Pending;
}
