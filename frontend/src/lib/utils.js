import { formatDate, formatDistanceToNow } from 'date-fns';

export const formatQuizDate = (date) => {
  return formatDate(new Date(date), 'MMM dd, yyyy');
};

export const formatQuizTime = (date) => {
  return formatDate(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};