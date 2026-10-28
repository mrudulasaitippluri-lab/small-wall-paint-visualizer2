import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

type PaintColor = { _id?: string; name: string; hex: string; category: string; finish?: string; brand?: string };
type Project = { _id: string; title: string; previewImage: string; originalImage: string; color?: PaintColor; createdAt: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('paintCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  api = 'http://localhost:5000/api';
  page = 'studio';
  token = localStorage.getItem('swpv_token') || '';
  user: any = JSON.parse(localStorage.getItem('swpv_user') || 'null');
  authMode: 'login' | 'register' = 'login';
  authName = ''; authEmail = ''; authPassword = '';
  message = ''; error = '';
  colors: PaintColor[] = [];
  selectedColor: PaintColor = { name: 'Ocean Breeze', hex: '#78B7C5', category: 'Cool' };
  opacity = 0.65;
  projectTitle = 'My room refresh';
  originalImage = '';
  previewImage = '';
  polygon: {x:number,y:number}[] = [];
  drawing = false;
  projects: Project[] = [];
  adminColorName = ''; adminColorHex = '#8BAE9C'; adminCategory = 'Neutral';
  busy = false;

  constructor(private http: HttpClient) {}
  ngAfterViewInit() { this.loadColors(); }

  get headers() { return new HttpHeaders({ Authorization: `Bearer ${this.token}` }); }
  loadColors() {
    this.http.get<PaintColor[]>(`${this.api}/colors`).subscribe({
      next: colors => { this.colors = colors; if (colors.length) this.selectedColor = colors[0]; },
      error: () => this.error = 'Cannot connect to API. Start the backend on port 5000.'
    });
  }
  setPage(page: string) {
    this.page = page; this.message = ''; this.error = '';
    if (page === 'saved') this.loadProjects();
    if (page === 'admin') this.loadColors();
    setTimeout(() => this.drawCanvas(), 50);
  }
  submitAuth() {
    this.error = ''; this.message = '';
    const endpoint = this.authMode === 'login' ? 'login' : 'register';
    const body: any = { email: this.authEmail, password: this.authPassword };
    if (this.authMode === 'register') body.name = this.authName;
    this.http.post<any>(`${this.api}/auth/${endpoint}`, body).subscribe({
      next: result => {
        this.token = result.token; this.user = result.user;
        localStorage.setItem('swpv_token', this.token); localStorage.setItem('swpv_user', JSON.stringify(this.user));
        this.message = `Welcome${this.user.name ? ', ' + this.user.name : ''}!`;
        this.authPassword = ''; this.setPage('studio');
      }, error: err => this.error = err.error?.message || 'Authentication failed.'
    });
  }
  logout() {
    this.token = ''; this.user = null;
    localStorage.removeItem('swpv_token'); localStorage.removeItem('swpv_user');
    this.setPage('studio'); this.message = 'You have signed out.';
  }
  chooseFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { this.error = 'Please upload a JPG or PNG image.'; return; }
    if (file.size > 6 * 1024 * 1024) { this.error = 'Please use an image smaller than 6 MB.'; return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.originalImage = String(reader.result);
      this.previewImage = this.originalImage; this.polygon = []; this.drawing = false;
      setTimeout(() => this.drawCanvas(), 80);
      this.message = 'Photo ready. Click around a wall to mark its boundary.';
    };
    reader.readAsDataURL(file);
  }
  startUpload() { this.imageInput.nativeElement.click(); }
  canvasClick(event: MouseEvent) {
    if (!this.originalImage || !this.drawing) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.polygon.push({
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    });
    this.drawCanvas();
  }
  beginPolygon() {
    if (!this.originalImage) { this.error = 'Upload a room photo first.'; return; }
    this.polygon = []; this.drawing = true; this.message = 'Click at least 3 points around the wall, then choose “Finish wall”.';
    this.drawCanvas();
  }
  finishPolygon() {
    if (this.polygon.length < 3) { this.error = 'Mark at least 3 points to make a wall selection.'; return; }
    this.drawing = false; this.applyPaint();
  }
  applyPaint() {
    if (!this.originalImage) { this.error = 'Upload a room photo first.'; return; }
    this.drawing = false;
    const img = new Image();
    img.onload = () => {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      if (this.polygon.length >= 3) {
        ctx.save(); ctx.beginPath();
        this.polygon.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath(); ctx.clip();
        ctx.globalAlpha = this.opacity; ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = this.selectedColor.hex; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      this.previewImage = canvas.toDataURL('image/jpeg', 0.88);
    };
    img.src = this.originalImage;
  }
  drawCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.originalImage) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      if (this.polygon.length) {
        ctx.beginPath();
        this.polygon.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        if (this.polygon.length >= 3) ctx.closePath();
        ctx.strokeStyle = '#f6c453'; ctx.lineWidth = Math.max(3, img.naturalWidth / 300); ctx.stroke();
        this.polygon.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(4, img.naturalWidth / 180), 0, Math.PI * 2); ctx.fillStyle = '#f6c453'; ctx.fill(); });
      }
    };
    img.src = this.originalImage;
  }
  saveProject() {
    if (!this.user || !this.token) { this.error = 'Please sign in to save your design.'; this.setPage('auth'); return; }
    if (!this.originalImage || !this.previewImage) { this.error = 'Upload a room photo and apply a colour first.'; return; }
    this.busy = true; this.error = '';
    this.http.post(`${this.api}/projects`, {
      title: this.projectTitle, originalImage: this.originalImage, previewImage: this.previewImage,
      polygon: this.polygon, color: { name: this.selectedColor.name, hex: this.selectedColor.hex }, opacity: this.opacity
    }, { headers: this.headers }).subscribe({
      next: () => { this.busy = false; this.message = 'Design saved to your account.'; },
      error: err => { this.busy = false; this.error = err.error?.message || 'Could not save design.'; }
    });
  }
  loadProjects() {
    if (!this.token) { this.projects = []; return; }
    this.http.get<Project[]>(`${this.api}/projects`, { headers: this.headers }).subscribe({
      next: projects => this.projects = projects,
      error: err => this.error = err.error?.message || 'Could not load saved designs.'
    });
  }
  openProject(project: Project) {
    this.originalImage = project.originalImage; this.previewImage = project.previewImage;
    this.projectTitle = project.title; this.polygon = []; this.setPage('studio');
    setTimeout(() => this.drawCanvas(), 100);
  }
  deleteProject(project: Project) {
    if (!confirm(`Delete "${project.title}"?`)) return;
    this.http.delete(`${this.api}/projects/${project._id}`, { headers: this.headers }).subscribe({
      next: () => { this.projects = this.projects.filter(p => p._id !== project._id); this.message = 'Project deleted.'; },
      error: () => this.error = 'Could not delete project.'
    });
  }
  downloadImage() {
    if (!this.previewImage) { this.error = 'There is no preview to download yet.'; return; }
    const a = document.createElement('a'); a.href = this.previewImage; a.download = 'my-wall-paint-preview.jpg'; a.click();
  }
  addColor() {
    if (!this.token) { this.error = 'Sign in as an admin to manage colours.'; return; }
    this.http.post<PaintColor>(`${this.api}/colors`, { name: this.adminColorName, hex: this.adminColorHex, category: this.adminCategory, finish: 'Matte', brand: 'Custom' }, { headers: this.headers })
      .subscribe({ next: color => { this.colors = [...this.colors, color]; this.adminColorName = ''; this.message = 'Colour added.'; }, error: err => this.error = err.error?.message || 'Admin access required.' });
  }
  removeColor(color: PaintColor) {
    if (!color._id || !this.token) return;
    this.http.delete(`${this.api}/colors/${color._id}`, { headers: this.headers }).subscribe({
      next: () => this.colors = this.colors.filter(c => c._id !== color._id),
      error: err => this.error = err.error?.message || 'Admin access required.'
    });
  }
}
