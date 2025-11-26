// server/src/utils/orderStatus.js

export const STATUS = {
  PENDING: "Chờ xác nhận",
  ACCEPTED: "Đã nhận",
  MOVING: "Đang di chuyển",
  CARING: "Đang chăm",
  DONE: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export const canCustomerCancel = (status) =>
  status === STATUS.PENDING;

export const nextStatusForStaffAction = (current, action) => {
  if (action === "accept" && current === STATUS.PENDING) return STATUS.ACCEPTED;
  if (action === "move" && current === STATUS.ACCEPTED) return STATUS.MOVING;
  if (action === "care" && current === STATUS.MOVING) return STATUS.CARING;
  if (action === "complete" && current === STATUS.CARING) return STATUS.DONE;
  return null;
};
