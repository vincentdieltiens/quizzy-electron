import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top9Component } from './top9.component';

describe('Top9Component', () => {
  let component: Top9Component;
  let fixture: ComponentFixture<Top9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Top9Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Top9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
