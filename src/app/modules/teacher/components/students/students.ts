import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../services/teacher.service';
import { ActivatedRoute } from '@angular/router';
import { ClassDataService } from '../../services/class-data/class-data';

interface StudentRow {
  fullName: string;
  email: string;
  contactNumber: string;
  userName: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.scss']
})
export class Students {
  classId!: number;
  classData: any;
  title = '';
  q = '';
  showModal = false;
  searchTerm = '';
  suggestions: any[] = [];
  selectedUser: any = null;

  rows: StudentRow[] = [];

  constructor(
    private route: ActivatedRoute, 
    private teacherService: TeacherService,
    private classDataService: ClassDataService
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
      this.classDataService.selectedClass$.subscribe(data => {
      this.classData = data;
      this.title=data.className;
      console.log('Received class:', this.classData);
    });
    this.loadStudents();
  }

  /** ✅ Load mock or API-based student list */
  loadStudents(): void {
    this.teacherService.getStudentsByClass(this.classId).subscribe({
      next: (res: any) => {
        console.log('📥 Students Response:', res);
  
        // API returns { code, message, body }
        if (res && res.body && Array.isArray(res.body)) {
          this.rows = res.body.map((s: any) => ({
            fullName: s.fullName,
            email: s.email,
            contactNumber: s.contactNumber || '-',
            userName: s.userName
          }));
        } else {
          this.rows = [];
        }
  
        console.log('✅ Students loaded:', this.rows);
      },
      error: (err) => {
        console.error('❌ Error loading students:', err);
        this.rows = [];
      }
    });
  }

  /** ✅ Filter table rows by search input */
  filtered(): StudentRow[] {
    const t = this.q.trim().toLowerCase();
    return !t
      ? this.rows
      : this.rows.filter(r =>
          r.fullName.toLowerCase().includes(t) ||
          r.userName.toLowerCase().includes(t) ||
          r.email.toLowerCase().includes(t)
        );
  }

  /** ✅ Open Add Student Modal */
  addStudent(): void {
    this.showModal = true;
    this.searchTerm = '';
    this.suggestions = [];
    this.selectedUser = null;
  }

  /** ✅ Close Modal */
  closeModal(): void {
    this.showModal = false;
  }

  /** ✅ Typeahead search students by username */
  onSearchChange(): void {
    const term = this.searchTerm.trim();
    if (term.length < 2) {
      this.suggestions = [];
      return;
    }

    this.teacherService.getStudentsByUserName(term).subscribe({
      next: (res: any) => {
        this.suggestions = res.body || [];
      },
      error: (err) => {
        console.error('❌ Error fetching students:', err);
        this.suggestions = [];
      }
    });
  }

  /** ✅ Select student from suggestions */
  selectUser(user: any): void {
    this.selectedUser = user;
    console.log("user",user);
    
    this.searchTerm = user.userName;
    this.suggestions = [];
    this
  }

  /** ✅ Save student to class (mock implementation) */
  
  /** ✅ Save student using backend API */
  saveStudent(): void {
    if (!this.selectedUser) {
      alert('⚠️ Please select a student first.');
      return;
    }

    this.teacherService.addStudentToClass(this.classId, this.selectedUser.id).subscribe({
      next: () => {
        // alert(`✅ ${this.selectedUser.firstName} ${this.selectedUser.lastName} added successfully!`);
        this.loadStudents(); // reload table
        this.closeModal();
      },
      error: (err) => {
        // console.error('❌ Failed to add student:', err);
        alert('❌ Could not add student to class.');
      }
    });
  }
}
