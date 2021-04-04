export enum ADMIN_ROLE_ENUM {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
}

export enum ADMIN_VERIFIED_ENUM {
  SHELL = 'SHELL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
}

export enum BILLING_ACTION {
  AUTHORIZE = 'AUTHORIZE',
  CAPTURE = 'CAPTURE',
}

export enum BILLING_STATUS {
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  PENDING_120_DAYS = 'PENDING_120_DAYS',
  PENDING_WITHDRAWAL = 'PENDING_WITHDRAWAL',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  WITHDRAWN = 'WITHDRAWN',
  ADMIN = 'ADMIN',
}

export enum BILLING_TYPE {
  INTERNAL = 'INTERNAL',
  COURSE = 'COURSE',
  MENTORSHIP = 'MENTORSHIP',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum CONTRACT_PROGRESS_ENUM {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum COMPLAINT_TYPE_ENUM {
  COMMENT = 'COMMENT',
}

export enum INTERVAL_UNIT {
  DAILY = 'DAY',
  WEEKLY = 'WEEK',
  MONTHLY = 'MONTH',
  YEARLY = 'YEAR',
}

export enum LEVEL_ENUM {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum APPROVAL_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PRIVACY_PERMISSIONS_ENUM {
  FOLLOWING_ONLY = 'FOLLOWING_ONLY',
  ALL = 'ALL',
  NONE = 'NONE',
}

export enum VISIBILITY_ENUM {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
}

export enum STATUS_ENUM {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export enum USER_TYPE_ENUM {
  STUDENT = 'STUDENT',
  SENSEI = 'SENSEI',
  ADMIN = 'ADMIN',
}

export enum FOLLOWING_ENUM {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED',
  UNBLOCKED = 'UNBLOCKED',
}
