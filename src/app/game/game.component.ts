import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { timer, Subscription } from 'rxjs';

enum Result {
  Reset = "Reset",
  Won = "Won",
  Lost = "Lost"
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  level: string;
  fields: any[];
  private rows: number;
  private showCount: number;
  private minesCount: number;
  private subscribeTime = 0;
  modalRef: BsModalRef;
  @ViewChild('smModal') smModal;
  result: Result;
  hasTimerStarted = false;
  timer: NodeJS.Timer;

  constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService) {
    this.rows = 3;
    this.showCount = 0;
    this.result = Result.Reset;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.level = params.get('level');
      this.Reset();
    });
  }

  private GetMinesByLevel(level: string): any[] {
    var result = [];
    switch (level) {
      case 'easy':
        this.rows = 9;
        this.minesCount = 10;
        this.AllocateMines(result);
        break;
      case 'medium':
        this.rows = 16;
        this.minesCount = 40;
        this.AllocateMines(result);
        break;
      case 'hard':
        this.rows = 24;
        this.minesCount = 99;
        this.AllocateMines(result);
        break;
      default:
        throw new Error("Invalid level selected");
    }
    return result;
  }

  private AllocateMines(minesLocation: any[]) {
    while (minesLocation.length < this.minesCount) {
      let x = Math.floor(Math.random() * this.rows);
      let y = Math.floor(Math.random() * this.rows);
      if (minesLocation.findIndex(a => a[0] == x && a[1] == y) == -1) {
        minesLocation.push([x, y]);
      }
    }
  }

  private PlaceMines(mines): any[] {
    var mineFields = new Array(this.rows);
    for (let i = 0; i < this.rows; i++) {
      mineFields[i] = [];
      for (let j = 0; j < this.rows; j++) {
        mineFields[i].push({ x: i, y: j, show: false, value: 0 });
      }
    }
    for (let i = 0; i < mines.length; i++) {
      let x = mines[i][0];
      let y = mines[i][1];
      mineFields[x][y].value = -1;
      for (let j = x - 1; j <= x + 1; j++) {
        for (let k = y - 1; k <= y + 1; k++) {
          if (j >= 0 && j < this.rows && k >= 0 && k < this.rows && mineFields[j][k].value !== -1)
            mineFields[j][k].value++;
        }
      }
    }
    return mineFields;
  }

  OpenRegion(cell) {
    this.startStopwatch();
    if (!this.checkWin(cell)) {
      if (cell.value === -1) {
        this.result = Result.Lost;
        this.ShowMines();
        this.openModal();
        this.stopwatch();
      }
      else {
        if (cell.value === 0) {
          var selectedCells = [];
          selectedCells.push(cell);
          while (selectedCells.length > 0) {
            var current = selectedCells.shift();
            for (let i = current.x - 1; i <= current.x + 1; i++) {
              for (let j = current.y - 1; j <= current.y + 1; j++) {
                if (i >= 0 && i < this.rows && j >= 0 && j < this.rows && (i !== current.x || j !== current.y)) {
                  let row = this.fields[i];
                  let adjacentCell = row[j];
                  if (!adjacentCell.show && adjacentCell.value !== -1) {
                    if (!this.checkWin(adjacentCell))
                      if (adjacentCell.value === 0)
                        selectedCells.push(adjacentCell);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  checkWin(cell) {
    cell.show = true;
    this.showCount++;
    if (this.showCount == (this.rows ** 2 - this.minesCount)) {
      this.openModal();
      this.result = Result.Won;
      this.stopwatch();
      return true;
    }
    return false;
  }

  ShowMines() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (this.fields[i][j].value === -1)
          this.fields[i][j].show = true;
      }
    }
  }

  Reset() {
    this.smModal.hide();
    var mines = this.GetMinesByLevel(this.level);
    this.fields = this.PlaceMines(mines);
    this.result = Result.Reset;
    this.showCount = 0;
    this.subscribeTime = 0;
  }

  Back() {
    this.router.navigate(['']);
  }

  openModal() {
    this.smModal.config.ignoreBackdropClick = true;
    this.smModal.show();
  }

  startStopwatch() {
    if (!this.hasTimerStarted) {
      this.timer = setInterval(() => {
        this.subscribeTime += 1;
      }, 1000);
      this.hasTimerStarted = true;
    }
  }
  stopwatch() {
    this.hasTimerStarted = false;
    this.subscribeTime;
    clearInterval(this.timer);
  }

  ngOnDestory() {
    clearInterval(this.timer);
  }
}
