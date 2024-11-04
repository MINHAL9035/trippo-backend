import { Controller, Get, Param, Query } from '@nestjs/common';
import { SocketService } from '../service/socket.service';
@Controller('socket')
export class SocketController {
  constructor(private readonly _socketService: SocketService) {}
  @Get(':senderId/:receiverId')
  async getMessages(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this._socketService.getMessagesBetweenUsers(senderId, receiverId);
  }
  @Get('getMessageList')
  async getUserMessageList(@Query('userId') userId: string) {
    return this._socketService.getMessageList(userId);
  }
  @Get('notifications')
  async getNotifications(@Query('userId') userId: string) {
    return this._socketService.getNotifications(userId);
  }
}
