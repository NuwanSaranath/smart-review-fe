import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';

interface AssignmentRow {
  startDate: string;
  endDate: string;
  title: string;
  topic: string;
  isMcq: boolean;
  submitted: number;
  graded: number;
}

interface TopicItem {
  id: number;
  title: string;
}

@Component({
  selector: 'app-assignments-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assignments.html',
  styleUrls: ['./assignments.scss'],
})
export class Assignments {
  q = '';
  showModal = false;
  classId!: number;

  // File data
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  fileBase64: string | null = null;

  // Data arrays
  rows: AssignmentRow[] = [];
  topics: TopicItem[] = [];

  // Topic selection
  selectedTopicId: number | null = null;

  constructor(
    private teacherService: TeacherService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAssignments();
    this.loadTopics();
  }

  /** ✅ Load topics */
  loadTopics(): void {
    this.teacherService.getTopicsByClass(this.classId).subscribe({
      next: (res: any) => {
        if (res?.body && Array.isArray(res.body)) {
          this.topics = res.body.map((t: any) => ({
            id: t.id,
            title: t.title,
          }));
        }
      },
      error: (err) => console.error('❌ Error loading topics:', err),
    });
  }

  /** ✅ Load assignments */
  loadAssignments(): void {
    this.teacherService.getAssignmentsByClass(this.classId).subscribe({
      next: (res: any) => {
        if (res?.body && Array.isArray(res.body)) {
          this.rows = res.body.map((a: any) => ({
            startDate: a.startTime ? a.startTime.substring(0, 10) : 'N/A',
            endDate: a.endTime ? a.endTime.substring(0, 10) : 'N/A',
            title: a.assignmentName,
            topic: a.topicTitle || 'N/A',
            isMcq: a.isMcq ?? false,
            submitted: a.submittedCount || 0,
            graded: a.gradedCount || 0,
          }));
        }
      },
      error: (err) => console.error('❌ Error loading assignments:', err),
    });
  }

  /** ✅ Filtered table search */
  filtered(): AssignmentRow[] {
    const term = this.q.trim().toLowerCase();
    return !term
      ? this.rows
      : this.rows.filter(
          (r) =>
            r.title.toLowerCase().includes(term) ||
            r.topic.toLowerCase().includes(term)
        );
  }

  /** ✅ Open modal */
  openModal(): void {
    this.showModal = true;
    this.selectedTopicId = null;
    this.fileBase64 = null;
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  /** ✅ Close modal */
  closeModal(): void {
    this.showModal = false;
  }

  /** ✅ Handle file selection and convert to Base64 */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 10 * 1024 * 1024) {
        this.selectedFile = file;
        this.selectedFileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          this.fileBase64 = base64String;
          console.log('📎 File converted to Base64:', base64String.substring(0, 50) + '...');
        };
        reader.readAsDataURL(file);
      } else {
        alert('⚠️ File too large! Max 10MB.');
        this.selectedFile = null;
        this.selectedFileName = null;
      }
    } else {
      alert('⚠️ Please select a valid PDF file.');
    }
  }

  /** ✅ Add new assignment */
  addAssignment(form: any): void {
    if (form.valid && this.selectedTopicId && this.fileBase64) {
      const payload = {
        assignmentName: form.value.assignmentName,
        timeDuration: form.value.timeDuration || '01:00:00',
        startTime: new Date(form.value.startTime),
        endTime: new Date(form.value.endTime),
        isMcq: false,
        topicId: this.selectedTopicId,
        document: this.fileBase64, // ✅ send as Base64 (backend converts to byte[])
      };

      console.log('📤 Sending Assignment Payload:', payload);

      this.teacherService.createAssignment(payload).subscribe({
        next: () => {
          alert('✅ Assignment created successfully!');
          this.loadAssignments();
          form.reset();
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error creating assignment:', err);
          alert('❌ Failed to create assignment.');
        },
      });
    } else if (!this.fileBase64) {
      alert('⚠️ Please upload a PDF document.');
    } else {
      alert('⚠️ Please fill all required fields and select a topic.');
    }
  }
}
