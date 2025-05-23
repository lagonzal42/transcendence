import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page4Component } from './multiplayer-setup.component';

describe('Page4Component', () => {
  let component: Page4Component;
  let fixture: ComponentFixture<Page4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Page4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
