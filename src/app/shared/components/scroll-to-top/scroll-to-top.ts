import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEvent } from "rxjs";

@Component({
  selector: "app-scroll-to-top",
  templateUrl: "./scroll-to-top.html",
  styleUrl: "./scroll-to-top.scss",
})
export class ScrollToTop {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isVisible = signal(false);

  constructor() {
    afterNextRender(() => {
      this.updateVisibility();

      fromEvent(window, "scroll")
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateVisibility());
    });
  }

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  private updateVisibility(): void {
    this.isVisible.set(window.scrollY > 400);
  }
}
