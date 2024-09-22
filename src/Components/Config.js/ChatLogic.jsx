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

export const isNewTime = (newTime, i, prevTime) => {
  const currentTimestamp = new Date(newTime);
  if (i === 0) {
    return true;
  }
  const currentDate = currentTimestamp.toDateString();
  const prevDate = prevTime ? prevTime.toDateString() : null;

  if (prevDate !== currentDate) {
    return true;
  } else {
    return false;
  }
};
