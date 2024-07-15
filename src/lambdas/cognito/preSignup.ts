import { PreSignUpTriggerHandler, PreSignUpTriggerEvent } from "aws-lambda";

export const handler: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent
) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};
