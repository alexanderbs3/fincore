---
name: webgpu
description: >
  Skill para integrar efeitos visuais e aceleração gráfica via WebGPU / WebGL
  no projeto Angular ClinicaIES. Cobre: partículas, gradientes animados,
  shaders WGSL, canvas offscreen, fallback gracioso para navegadores sem
  suporte, e integração como Angular Directive/Service. Use este skill quando
  o usuário pedir efeitos visuais avançados, backgrounds animados, shaders,
  partículas, gráficos de alta performance, canvas 3D, ou qualquer menção a
  WebGPU, WebGL, WGSL, Three.js, ou efeitos de GPU no projeto Angular.
---

# WebGPU Skill — ClinicaIES

## Visão Geral

WebGPU é a API moderna de acesso à GPU no browser (sucessora do WebGL). No contexto do ClinicaIES, é usado para efeitos visuais premium — backgrounds animados no login, partículas no dashboard, glows dinâmicos — sem impactar a lógica de negócio.

---

## Suporte e Fallback

```typescript
// webgpu-check.ts
export async function checkWebGPU(): Promise<boolean> {
  if (!navigator.gpu) return false;
  const adapter = await navigator.gpu.requestAdapter();
  return adapter !== null;
}

// Fallback gracioso: CSS animation puro
export function applyFallbackBackground(el: HTMLElement) {
  el.style.background = `
    radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%),
    var(--color-bg)
  `;
}
```

---

## Angular Directive para Background GPU

```typescript
// gpu-background.directive.ts
import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({ selector: '[gpuBackground]', standalone: true })
export class GpuBackgroundDirective implements OnInit, OnDestroy {
  @Input() gpuIntensity: 'low' | 'medium' | 'high' = 'medium';

  private canvas!: HTMLCanvasElement;
  private animId!: number;

  constructor(private el: ElementRef<HTMLElement>) {}

  async ngOnInit() {
    const supported = await checkWebGPU();
    if (!supported) {
      applyFallbackBackground(this.el.nativeElement);
      return;
    }
    this.setupCanvas();
    await this.initWebGPU();
  }

  private setupCanvas() {
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'absolute', inset: '0',
      width: '100%', height: '100%',
      zIndex: '0', pointerEvents: 'none'
    });
    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.prepend(this.canvas);
  }

  private async initWebGPU() {
    const adapter = await navigator.gpu!.requestAdapter();
    const device = await adapter!.requestDevice();
    const ctx = this.canvas.getContext('webgpu')!;
    const format = navigator.gpu!.getPreferredCanvasFormat();

    ctx.configure({ device, format });
    this.renderParticleLoop(device, ctx, format);
  }

  private renderParticleLoop(device: GPUDevice, ctx: GPUCanvasContext, format: GPUTextureFormat) {
    // Shader WGSL para partículas flutuantes
    const shader = device.createShaderModule({ code: PARTICLE_SHADER_WGSL });
    // ... pipeline setup e render loop
    const frame = () => {
      // render particles
      this.animId = requestAnimationFrame(frame);
    };
    frame();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.canvas?.remove();
  }
}
```

---

## Shader WGSL — Partículas Flutuantes

```wgsl
// particle.wgsl
struct Particle {
  pos: vec2f,
  vel: vec2f,
  life: f32,
  size: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> time: f32;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= arrayLength(&particles)) { return; }

  var p = particles[i];
  p.pos += p.vel * 0.016;
  p.life -= 0.005;

  // Rebote nas bordas
  if (p.pos.x < 0.0 || p.pos.x > 1.0) { p.vel.x *= -1.0; }
  if (p.pos.y < 0.0 || p.pos.y > 1.0) { p.vel.y *= -1.0; }

  // Reset quando morre
  if (p.life <= 0.0) {
    p.pos = vec2f(fract(sin(f32(i) * 78.233 + time) * 43758.5453));
    p.vel = vec2f(
      (fract(sin(f32(i) * 12.345 + time) * 43758.5) - 0.5) * 0.002,
      (fract(cos(f32(i) * 45.678 + time) * 43758.5) - 0.5) * 0.002
    );
    p.life = 0.5 + fract(sin(f32(i)) * 43758.5) * 0.5;
  }
  particles[i] = p;
}

// Fragment: ponto brilhante azul (cor do tema)
@fragment
fn fs_particle(@location(0) uv: vec2f) -> @location(0) vec4f {
  let d = length(uv - 0.5) * 2.0;
  let alpha = smoothstep(1.0, 0.0, d);
  // Azul primário do ClinicaIES: #3b82f6
  return vec4f(0.231, 0.510, 0.965, alpha * 0.6);
}
```

---

## Gradiente Animado (CSS — Fallback Premium)

Para browsers sem WebGPU, usar este CSS que emula o efeito:

```scss
// _gpu-gradient.scss
.gpu-gradient-bg {
  position: relative;
  overflow: hidden;

  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: drift 8s ease-in-out infinite alternate;
    z-index: 0;
    pointer-events: none;
  }

  &::before {
    width: 600px; height: 600px;
    top: -200px; left: -100px;
    background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
    animation-delay: 0s;
  }

  &::after {
    width: 400px; height: 400px;
    bottom: -100px; right: -50px;
    background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
    animation-delay: -4s;
  }

  > * { position: relative; z-index: 1; }
}

@keyframes drift {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -20px) scale(1.1); }
}
```

---

## Integração no Login Component

```html
<!-- login.component.html -->
<div class="login-wrapper gpu-gradient-bg" gpuBackground gpuIntensity="low">
  <div class="login-card">
    <!-- conteúdo do login -->
  </div>
</div>
```

---

## Performance Guidelines

| Cenário | Abordagem |
|---------|-----------|
| Background do Login | Canvas 2D offscreen + CSS fallback |
| Dashboard stats | SVG animado (sem GPU) |
| Partículas complexas | WebGPU compute shader |
| Gráficos de dados | Chart.js (canvas 2D) |
| Efeitos 3D | Three.js com WebGPU renderer |

---

## Checklist Antes de Implementar

- [ ] Checar suporte: `navigator.gpu` disponível?
- [ ] Implementar fallback CSS para Safari/Firefox sem flag
- [ ] `ngOnDestroy` cancela `requestAnimationFrame`
- [ ] Canvas com `pointer-events: none` (não bloqueia interações)
- [ ] Testar performance no mobile (limitar partículas)
- [ ] Respeitar `prefers-reduced-motion`

```scss
@media (prefers-reduced-motion: reduce) {
  .gpu-gradient-bg::before,
  .gpu-gradient-bg::after { animation: none; }
}
```
