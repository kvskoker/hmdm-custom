import { CUSTOM_MESSAGE_TYPE, MESSAGE_TYPE_OPTIONS } from '../const/message-type-options.const';

type TMessageTypeValue = {
  messageType: string;
  customMessageType: string;
};

export function toRequestMessageType(value: TMessageTypeValue): string {
  return value.messageType === CUSTOM_MESSAGE_TYPE
    ? value.customMessageType.trim()
    : value.messageType;
}

export function toFormMessageType(messageType: string): TMessageTypeValue {
  const isPredefined = MESSAGE_TYPE_OPTIONS.some((option) => option.value === messageType);

  return isPredefined
    ? { messageType, customMessageType: '' }
    : { messageType: CUSTOM_MESSAGE_TYPE, customMessageType: messageType };
}
