export const isSameSenderMargin = (messages, m, i, userId) => {
  if (i < messages.length - 1) {
    if (messages[i + 1].sender === m.sender && messages[i].sender !== userId) {
      return 33;
    }
    if (messages[i + 1].sender !== m.sender && messages[i].sender !== userId) {
      return 0;
    }
  }
  if (i === messages.length - 1 && messages[i].sender !== userId) {
    return 0;
  }
  return "auto";
};

  
export const isSameSender = (messages, m, i, userId) => {
  if (i < messages.length - 1) {
    return (
      (messages[i + 1].sender !== m.sender || messages[i + 1].sender === undefined) &&
      messages[i].sender !== userId
    );
  }
  return messages[i].sender !== userId;
};

  
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[i].sender !== userId
  );
};

  
export const isSameUser = (messages, m, i) => {
  return i > 1 && messages[i - 1].sender === m.sender;
};

let prevtimestamp;
export const isNewTime = (newTime, i) => {
  if(i === 0) {
    prevtimestamp = new Date(newTime);
    return true;
  } else {
    let prevDate = prevtimestamp.toDateString();
    const timestamp = new Date(newTime);
    const newDate = timestamp.toDateString();
    const isDifferent = prevDate !== newDate;
    if (isDifferent) {
      prevDate = newDate;
      return true;
    }
    else return false;
  }
}