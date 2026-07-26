import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderNavbarComponent } from './header-navbar';
import { provideRouter } from '@angular/router';

describe('HeaderNavbarComponent', () => {
  let component: HeaderNavbarComponent;
  let fixture: ComponentFixture<HeaderNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the menu when the menu button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error('Menu button not found');
    }

    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close the menu when the menu button is clicked twice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error('Menu button not found');
    }

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close the menu and return focus to the button when Escape is pressed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    const firstNavigationLink = compiled.querySelector(
      '#main-navigation a',
    ) as HTMLAnchorElement | null;

    expect(button).toBeTruthy();
    expect(firstNavigationLink).toBeTruthy();

    if (!button || !firstNavigationLink) {
      throw new Error('Required navbar elements were not found');
    }

    button.click();
    fixture.detectChanges();

    firstNavigationLink.focus();

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});
