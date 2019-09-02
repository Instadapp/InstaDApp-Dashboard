import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectbtnComponent } from './connectbtn.component';

describe('ConnectbtnComponent', () => {
  let component: ConnectbtnComponent;
  let fixture: ComponentFixture<ConnectbtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectbtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
