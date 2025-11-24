const amqplib = require("amqplib");

(async () => {
  try {
    const connection = await amqplib.connect("amqp://root:root@localhost");

    // 创建一个通道。通道是进行通信的基本单位，通过通道可以发送和接收消息
    const channel = await connection.createChannel();

    // 队列的名字是：hello
    const queue = "hello";

    // 要发送的消息内容是：你好，KeyValut Pro!
    const msg = "你好，KeyValut Pro!";

    // 创建一个队列。如果队列不存在，则创建一个队列。如果队列已经存在，则不会创建新的队列
    // durable: 表示队列是否持久化。如果设置为true，队列信息将被写入磁盘, 在RabbitMQ服务重启后仍然存在（即重启后队列不会消失）
    // 但是队列已经创建过后，这个参数就没法改了，可以删掉队列，重新建一个新的
    await channel.assertQueue(queue, { durable: true });

    // 发送消息到队列
    // queue: 要发送消息的队列的名字
    // content: 要发送的消息内容
    // persistent: true，消息持久化，消息将会被写入磁盘，确保消息在 RabbitMQ 重启后(未处理的消息)仍然存在。
    channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

    // 打印发送提示信息
    console.log("[x] 发送了：%s", msg);

    // 500ms 后关闭连接
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
})();
