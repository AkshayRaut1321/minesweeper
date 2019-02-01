import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  level: string;
  fields: any[];
  gameOver: boolean;
  private rows: number;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.gameOver = false;
    this.rows = 3;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.level = params.get('level');
      this.Reset();
    });
  }

  private GetMinesByLevel(level: string): any[] {
    var result = [];
    let minesCount: number;
    switch (level) {
      case 'easy':
        this.rows = 9;
        minesCount = 15;
        this.AllocateMines(result, minesCount);
        break;
      case 'medium':
        this.rows = 16;
        minesCount = 40;
        this.AllocateMines(result, minesCount);
        break;
      case 'hard':
        this.rows = 24;
        minesCount = 99;
        this.AllocateMines(result, minesCount);
        break;
      default:
        throw new Error("Invalid level selected");
    }
    return result;
  }

  private AllocateMines(minesLocation: any[], minesCount: number) {
    while (minesLocation.length < minesCount) {
      let x = Math.floor(Math.random() * this.rows);
      let y = Math.floor(Math.random() * this.rows);
      console.log(minesLocation.findIndex(a => a[0] == x && a[1] == y));
      if (minesLocation.findIndex(a => a[0] == x && a[1] == y) == -1){
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
    cell.show = true;
    if (cell.value === -1) {
      this.gameOver = true;
      this.ShowMines();
    }
    else if (cell.value === 0) {
      for (let i = cell.x - 1; i <= cell.x + 1; i++) {
        for (let j = cell.y - 1; j <= cell.y + 1; j++) {
          if (i >= 0 && i < this.rows && j >= 0 && j < this.rows && (i !== cell.x || j !== cell.y)) {
            let row = this.fields[i];
            let adjacentCell = row[j];
            if (!adjacentCell.show) {
              if (adjacentCell.value === 0) {
                adjacentCell.show = true;
                this.OpenRegion(adjacentCell);
              }
              else if (adjacentCell.value !== -1)
                adjacentCell.show = true;
            }
          }
        }
      }
    }
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
    var mines = this.GetMinesByLevel(this.level);
    this.fields = this.PlaceMines(mines);
    this.gameOver = false;
  }

  Back(){
    this.router.navigate(['']);
  }
}
