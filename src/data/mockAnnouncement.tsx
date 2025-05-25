export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "classroom" | "college";
  priority: "low" | "medium" | "high";
  author: string;
  authorId: string;
  classroom?: string;
  createdAt: string;
}

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann_1",
    title: "Midterm Exam Schedule Released",
    content: `Dear students,
  
  The midterm examination schedule has been finalized and is now available. Please note the following important details:
  
  • Exam dates: March 15-22, 2024
  • All exams will be held in the main examination hall
  • Students must bring their ID cards and writing materials
  • Late arrivals (more than 15 minutes) will not be permitted
  
  Please review the schedule carefully and contact me if you have any conflicts.
  
  Good luck with your preparations!`,
    type: "classroom",
    priority: "high",
    author: "Dr. Sarah Johnson",
    authorId: "faculty_1",
    classroom: "CS101",
    createdAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "ann_2",
    title: "Library Hours Extended During Finals Week",
    content: `Attention all students and faculty,
  
  The college library will extend its operating hours during finals week to support your academic needs:
  
  • Monday - Thursday: 7:00 AM - 2:00 AM
  • Friday: 7:00 AM - 10:00 PM
  • Saturday: 9:00 AM - 10:00 PM
  • Sunday: 10:00 AM - 2:00 AM
  
  Additional study spaces will be available in the student center. Quiet zones will be strictly enforced.
  
  We wish you the best in your final examinations!`,
    type: "college",
    priority: "medium",
    author: "College Administration",
    authorId: "admin_1",
    createdAt: "2024-01-19T14:15:00Z",
  },
  {
    id: "ann_3",
    title: "Assignment 3 Due Date Extended",
    content: `Hello everyone,
  
  Due to the recent technical issues with the submission portal, I am extending the due date for Assignment 3.
  
  New due date: Friday, January 26th at 11:59 PM
  
  Please ensure you submit your work through the course portal. If you continue to experience technical difficulties, please email me directly.
  
  Thank you for your patience.`,
    type: "classroom",
    priority: "medium",
    author: "Prof. Michael Chen",
    authorId: "faculty_2",
    classroom: "CS201",
    createdAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "ann_4",
    title: "Campus Wi-Fi Maintenance",
    content: `Dear campus community,
  
  Please be advised that scheduled maintenance will be performed on the campus Wi-Fi network this weekend:
  
  Date & Time: Saturday, January 21st, 2:00 AM - 6:00 AM
  
  During this time, internet connectivity may be intermittent or unavailable. We apologize for any inconvenience and appreciate your understanding as we work to improve our network infrastructure.
  
  For urgent connectivity needs, the computer labs in the library will remain accessible.`,
    type: "college",
    priority: "low",
    author: "IT Services",
    authorId: "admin_2",
    createdAt: "2024-01-17T09:20:00Z",
  },
  {
    id: "ann_5",
    title: "Guest Lecture: Machine Learning in Healthcare",
    content: `Dear CS students,
  
  We are excited to announce a special guest lecture by Dr. Emily Rodriguez from Stanford University:
  
  Topic: "Machine Learning Applications in Modern Healthcare"
  Date: Tuesday, January 30th
  Time: 2:00 PM - 3:30 PM
  Location: Auditorium A
  
  Dr. Rodriguez is a leading researcher in AI applications for medical diagnosis. This is an excellent opportunity to learn about cutting-edge research in our field.
  
  The lecture is open to all CS students. Refreshments will be provided.
  
  Please RSVP by January 28th.`,
    type: "classroom",
    priority: "low",
    author: "Dr. James Wilson",
    authorId: "faculty_3",
    classroom: "CS301",
    createdAt: "2024-01-16T11:10:00Z",
  },
  {
    id: "ann_6",
    title: "New COVID-19 Guidelines",
    content: `Important Health and Safety Update:
  
  Following recent CDC guidelines, the college has updated its COVID-19 protocols effective immediately:
  
  • Masks are recommended but not required in indoor spaces
  • Students feeling unwell should not attend classes and should notify instructors
  • Hand sanitizing stations remain available throughout campus
  • Vaccination clinics are still available at the health center
  
  Please continue to prioritize your health and the health of our community.
  
  For questions, contact the Health Services office at health@college.edu`,
    type: "college",
    priority: "high",
    author: "Health Services",
    authorId: "admin_3",
    createdAt: "2024-01-15T08:00:00Z",
  },
];
