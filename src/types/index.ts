export enum ContentType {
  NOTE = "NOTE",
  LINK = "LINK",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

export interface EducationalContent {
  id: string;
  unitId: string;
  type: ContentType;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  classroomId: string;
  description?: string;
  educationalContents: EducationalContent[];
  createdAt: string;
  updatedAt: string;
}

export interface VirtualClassroom {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
}

export interface UnitSummary {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  contentsCount: {
    [ContentType.NOTE]: number;
    [ContentType.LINK]: number;
    [ContentType.VIDEO]: number;
    [ContentType.DOCUMENT]: number;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  date: string;
  presentStudents: string[];
  absentStudents: string[];
  totalStudents: number;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}
