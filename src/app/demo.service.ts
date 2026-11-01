import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DemoItem } from './demo-item';

/**
 * Appelle l'API en chemin relatif : en production, nginx relaie /api vers le service
 * api-demo du cluster ; en développement, proxy.conf.json relaie vers localhost:8080.
 */
@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly http = inject(HttpClient);

  list(): Observable<DemoItem[]> {
    return this.http.get<DemoItem[]>('/api/demo');
  }
}
