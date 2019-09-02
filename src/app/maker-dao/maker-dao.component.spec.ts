import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakerDaoComponent } from './maker-dao.component';

describe('MakerDaoComponent', () => {
  let component: MakerDaoComponent;
  let fixture: ComponentFixture<MakerDaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakerDaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakerDaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
