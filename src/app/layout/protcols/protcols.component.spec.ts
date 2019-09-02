import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtcolsComponent } from './protcols.component';

describe('ProtcolsComponent', () => {
  let component: ProtcolsComponent;
  let fixture: ComponentFixture<ProtcolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtcolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtcolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
