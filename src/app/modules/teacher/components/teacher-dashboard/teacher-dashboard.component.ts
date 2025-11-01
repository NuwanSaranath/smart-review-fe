import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Metric { label: string; value: string; }
interface GlanceItem {
  icon: 'class' | 'assignment' | 'bookmark';
  title: string;
  sub: string;            // time or due text
  actionLabel?: string;   // right side text
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent {
  name = 'Mr. Nuwan Saranath';

  metrics: Metric[] = [

    { label: 'Total Classes', value: '3' },
    { label: 'Total Students', value: '4' }
  ];

  glance: GlanceItem[] = [

    { icon:'assignment', title:'Assignment 1 - Set Theory',        sub:'Due: Sep 15',          },
    { icon:'assignment', title:'Assignment 2 - Calculus II',       sub:'Due: Sep 10',         },
    { icon:'assignment', title:'Assignment 3',  sub:'Due: Sep 5',           }
  ];
}