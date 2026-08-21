import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface NavItem {
  label: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: number;      // positive = up, negative = down
  trendLabel: string;
  accent: 'green' | 'blue' | 'amber' | 'red';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  collapsed = false;

  activeItem = 'Dashboard';

  searchQuery = '';

  navGroups: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'grid' },
        { label: 'Compliance', icon: 'shield' },
        { label: 'Locations', icon: 'map-pin' },
        { label: 'Reports', icon: 'cloud' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Audits', icon: 'clipboard' },
        { label: 'Inspections', icon: 'check-square' },
        { label: 'Incidents', icon: 'alert' },
        { label: 'Documents', icon: 'file' }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Notifications', icon: 'bell', badge: 6 },
        { label: 'Messages', icon: 'message', badge: 3 },
        { label: 'Settings', icon: 'settings' },
        { label: 'Support', icon: 'help' }
      ]
    }
  ];

  statCards: StatCard[] = [
    { label: 'Compliance Score', value: '94%', icon: 'shield', trend: 2.4, trendLabel: 'vs last month', accent: 'green' },
    { label: 'Open Audits', value: '3', icon: 'clipboard', trend: -1, trendLabel: 'vs last month', accent: 'blue' },
    { label: 'Locations', value: '12', icon: 'map-pin', trend: 0, trendLabel: 'no change', accent: 'amber' },
    { label: 'Pending Reviews', value: '7', icon: 'alert', trend: 3.1, trendLabel: 'vs last month', accent: 'red' }
  ];

  constructor(private readonly router: Router) {}

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  selectItem(label: string): void {
    this.activeItem = label;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}