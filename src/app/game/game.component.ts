import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

enum Result {
  Reset = "Reset",
  Won = "Won",
  Lost = "Lost",
  InProgress = "InProgress"
}

class Cell {
  constructor(public x: number, public y: number, public show: boolean, public value: number, public flagged: boolean) {
  }
}

class Mine {
  constructor(public x: number, public y: number) {
  }
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
  private activeMines: number;
  subscribeTime = 0;
  modalRef: BsModalRef;
  @ViewChild('smModal') smModal;
  status: Result;
  hasTimerStarted = false;
  timer: any;
  private mineFlag: string;

  constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService) {
    this.rows = 3;
    this.showCount = 0;
    this.status = Result.Reset;
    this.mineFlag = "assets/flag_icon_minesweeper.png";
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.level = params.get('level');
      this.Reset();
    });
  }

  private GetMinesByLevel(level: string): Mine[] {
    var result: Mine[] = [];
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
    this.activeMines = this.minesCount;
    return result;
  }

  private AllocateMines(minesLocation: Mine[]) {
    while (minesLocation.length < this.minesCount) {
      let x = Math.floor(Math.random() * this.rows);
      let y = Math.floor(Math.random() * this.rows);
      if (minesLocation.findIndex(a => a[0] == x && a[1] == y) == -1) {
        minesLocation.push(new Mine(x, y));
      }
    }
  }

  private PlaceMines(mines: Mine[]): any[] {
    var mineFields = new Array(this.rows);
    for (let i = 0; i < this.rows; i++) {
      mineFields[i] = [];
      for (let j = 0; j < this.rows; j++) {
        mineFields[i].push(new Cell(i, j, false, 0, false));
      }
    }
    for (let i = 0; i < mines.length; i++) {
      let x = mines[i].x;
      let y = mines[i].y;
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

  OpenRegion(cell: Cell) {
    if (cell.flagged || cell.show)
      return;
    this.status = Result.InProgress;
    this.startStopwatch();
    if (!this.checkWin(cell)) {
      if (cell.value === -1) {
        this.status = Result.Lost;
        this.ShowMines();
        this.openModal();
        this.stopwatch();
      }
      else {
        if (cell.value === 0) {
          var selectedCells: Cell[] = [];
          selectedCells.push(cell);
          while (selectedCells.length > 0) {
            var current: Cell = selectedCells.shift();
            for (let i = current.x - 1; i <= current.x + 1; i++) {
              for (let j = current.y - 1; j <= current.y + 1; j++) {
                if (i >= 0 && i < this.rows && j >= 0 && j < this.rows && (i !== current.x || j !== current.y)) {
                  let row = this.fields[i];
                  let adjacentCell: Cell = row[j];
                  if (!adjacentCell.show && adjacentCell.value !== -1 && !adjacentCell.flagged) {
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

  checkWin(cell: Cell) {
    cell.show = true;
    this.showCount++;
    if (this.showCount == (this.rows ** 2 - this.minesCount)) {
      this.openModal();
      this.status = Result.Won;
      this.stopwatch();
      return true;
    }
    return false;
  }

  ShowMines() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.rows; j++) {
        var currentCell: Cell = this.fields[i][j];
        if (currentCell.value === -1) {
          currentCell.show = true;
        }
      }
    }
  }

  Reset() {
    this.stopwatch();
    this.smModal.hide();
    var mines: Mine[] = this.GetMinesByLevel(this.level);
    this.fields = this.PlaceMines(mines);
    this.status = Result.Reset;
    this.showCount = 0;
    this.subscribeTime = 0;
  }

  HideModal() {
    this.smModal.hide();
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

  flagForMine(cell: Cell) {
    if (cell.show)
      return false;
    if (this.status == Result.InProgress) {
      if (cell.flagged && this.activeMines < this.minesCount) {
        cell.flagged = false;
        this.activeMines++;
      }
      else if (this.activeMines > 0) {
        cell.flagged = true;
        this.activeMines--;
      }
    }
    return false;
  }

  ngOnDestory() {
    clearInterval(this.timer);
  }
}
