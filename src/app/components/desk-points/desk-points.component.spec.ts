import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskPointsComponent } from './desk-points.component';

describe('DeskPointsComponent', () => {
  let component: DeskPointsComponent;
  let fixture: ComponentFixture<DeskPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeskPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeskPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
