import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfileComponentComponent } from './update-profile-component.component';

describe('UpdateProfileComponentComponent', () => {
  let component: UpdateProfileComponentComponent;
  let fixture: ComponentFixture<UpdateProfileComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProfileComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateProfileComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
