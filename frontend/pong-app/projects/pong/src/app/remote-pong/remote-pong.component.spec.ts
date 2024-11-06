import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemotePongComponent } from './remote-pong.component';

describe('RemotePongComponent', () => {
  let component: RemotePongComponent;
  let fixture: ComponentFixture<RemotePongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemotePongComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemotePongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
