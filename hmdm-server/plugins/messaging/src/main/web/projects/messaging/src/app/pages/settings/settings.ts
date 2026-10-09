import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  imports: [MatCardModule, TextInputComponent, TranslatePipe, ReactiveFormsModule, MatButtonModule],
})
export class Settings {
  private readonly messagesService: MessagesService = inject(MessagesService);

  purgeControl = new FormControl(7, { nonNullable: true });

  onPurge(): void {
    const days = this.purgeControl.value;
    this.messagesService.purgeMessages(days).subscribe();
  }
}
