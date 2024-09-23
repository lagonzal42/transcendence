import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPlayComponent } from './local-play.component';

describe('LocalPlayComponent', () => {
  let component: LocalPlayComponent;
  let fixture: ComponentFixture<LocalPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalPlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocalPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
