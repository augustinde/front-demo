import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { DemoItem } from './demo-item';
import { DemoService } from './demo.service';

type State = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-root',
  imports: [DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly demoService = inject(DemoService);

  protected readonly state = signal<State>('loading');
  protected readonly items = signal<DemoItem[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.error.set(null);
    this.demoService.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.state.set('ready');
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Erreur inconnue');
        this.state.set('error');
      },
    });
  }
}
