import { Component } from '@angular/core';
import { MatTabsModule, TranslatePipe } from 'hmdm-ui-kit';
import { Messages } from '../../components/messages/messages';
import { Tasks } from '../../components/tasks/tasks';

@Component({
  selector: 'push-push',
  templateUrl: './push.html',
  styleUrl: './push.scss',
  imports: [MatTabsModule, Messages, Tasks, TranslatePipe],
})
export class Push {}
