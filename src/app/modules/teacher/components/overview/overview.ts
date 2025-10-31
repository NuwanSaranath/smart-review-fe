import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService } from '../../services/teacher.service';
import { ActivatedRoute } from '@angular/router';
import { ClassDataService } from '../../services/class-data/class-data';
import { JwtService } from '../../../../core/service/jwt-service';

interface Metric {
  label: string;
  value: string;
}

interface UpcomingAssignment {
  assignmentName: string;
  topicTitle: string;
  dueDate: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss']
})
export class Overview implements OnInit {
  metrics: Metric[] = [];
  rows: UpcomingAssignment[] = [];
  teacherId :number|null=null; 

  showModal = false;
  classId!: number;
  classData: any;
  title = '';
  constructor(
    private route: ActivatedRoute, 
    private teacherService: TeacherService,
    private classDataService: ClassDataService,
       private jwtService: JwtService,
  ) {

  }
  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherId = this.jwtService.getLogedUserId(); 
    console.log(" this.classId", this.classId);
    
      this.classDataService.selectedClass$.subscribe(data => {
      this.classData = data;
      this.title=data.className;
      console.log('Received class:', this.classData);
    });
    this.loadUpcomingAssignments();
  }




  /** ✅ Fetch Upcoming Assignments from Backend */
  loadUpcomingAssignments(): void {
    this.teacherService.getUpcomingAssignments(this.teacherId!, this.classId).subscribe({
      next: (res: any) => {
        if (res?.body) {
          const data = res.body;

          // ✅ Metrics (Total Students, Total Assignments)
          this.metrics = [
            { label: 'Total Students', value: String(data.totalStudent || 0) },
            { label: 'Total Assignments', value: String(data.totalAssignment || 0) },
          ];

          // ✅ Upcoming Assignments (Next 7 Days)
          this.rows = data.upcomingAssignmentDtoList?.map((a: any) => ({
            assignmentName: a.assignmentName,
            topicTitle: a.topicTitle,
            dueDate: new Date(a.dueDate).toLocaleDateString(),
          })) || [];
        }
        console.log('📊 Dashboard Loaded:', res.body);
      },
      error: (err) => {
        console.error('❌ Error loading dashboard:', err);
      },
    });
  }
  
}
