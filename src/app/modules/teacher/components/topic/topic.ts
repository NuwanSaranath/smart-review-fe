import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { ClassDataService } from '../../services/class-data/class-data';
import { TeacherService } from '../../services/teacher.service';

interface TopicRow {
  name: string;
  assignments: number;
  enabled?: boolean;
}

@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './topic.html',
  styleUrls: ['./topic.scss'],    
})
export class Topic {
  q = '';
  showModal = false;
  rows: TopicRow[] = [];
  classId!: number;
  classData: any;
  title = '';
  constructor(
    private route: ActivatedRoute, 
    private teacherService: TeacherService,
    private classDataService: ClassDataService
  ) {

  }
  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
      this.classDataService.selectedClass$.subscribe(data => {
      this.classData = data;
      this.title=data.className;
      console.log('Received class:', this.classData);
    });
    this.loadTopics();
  }
  loadTopics() {
    this.teacherService.getTopicsByClass(this.classId).subscribe({
      next: (res: any) => {
        if (res && res.body) {
          // When wrapped in APIResponse
          this.rows = res.body.map((t: any) => ({
            name: t.title,
            assignments: t.assignmentCount || 0, // adjust based on your TopicResponseDto
            enabled: true
          }));
        } else if (res.data) {
          // if response in format { code, data }
          this.rows = res.data.map((t: any) => ({
            name: t.title,
            assignments: t.assignmentCount || 0,
            enabled: true
          }));
        } else if (Array.isArray(res)) {
          // if backend returns pure list
          this.rows = res.map((t: any) => ({
            name: t.title,
            assignments: t.assignmentCount || 0,
            enabled: true
          }));
        }
        console.log(' Topics loaded:', this.rows);
      },
      error: (err) => {
        console.error(' Error loading topics:', err);
      }
    });
  }
  filtered() {
    const term = this.q.trim().toLowerCase();
    return !term ? this.rows : this.rows.filter(r => r.name.toLowerCase().includes(term));
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addTopic(form: any) {
    if (form.valid) {
      const payload = {
        title: form.value.name,
        class_id: this.classId
      };

      this.teacherService.createTopic(payload).subscribe({
        next: () => {
          // this.rows.push({ name: form.value.name, assignments: 0, enabled: true });
          form.reset();
          this.showModal = false;
          console.log(' Topic created successfully');
        },
        error: (err) => {
          console.error(' Error creating topic:', err);
        }
      });
    }
  }

  enable(r: TopicRow) {
    r.enabled = true;
  }
}