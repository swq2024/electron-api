const amqplib = require("amqplib");

(async () => {
  try {
    // 连接到 RabbitMQ
    const connection = await amqplib.connect("amqp://root:root@localhost");

    // 创建一个通道。通道是进行通信的基本单位，通过通道可以发送和接收消息
    const channel = await connection.createChannel();

    // 队列的名字是：hello
    const queue = "hello";

    // 创建一个队列。如果队列不存在，则创建一个队列。如果队列已经存在，则不会创建新的队列
    // durable: 表示队列是否持久化。如果设置为true，即重启后队列不会消失
    await channel.assertQueue(queue, { durable: true });

    // 打印等待接收消息的提示信息
    console.log(" [*] 等待接收消息在 %s 队列中. 按 CTRL+C 退出", queue);

    // 当接收到消息
    channel.consume(
      queue,
      (msg) => {
        // 打印接收到的消息内容
        console.log("[x] 接收到了：%s", msg.content.toString());

        // 如果不是自动确认，需要手动确认消息
        // channel.ack(msg);
        try {
          // 如果noAck: false，需要手动确认消息，否则消息会被重复消费。例如：channel.ack(msg)
          channel.ack(msg);
          // 处理消息逻辑
          // ...
        } catch (error) {
          // 处理失败, 可以选择拒绝消息, 将消息从队列中删除
          // msg 代表消息唯一标识,RabbitMQ 为每个通过 channel.consume（推模式）传递给消费者的消息分配的唯一递增整数，用于标识 “当前 channel 上未确认的消息”。
          // ---------------------------------------------------------------
          // msg.allUpTo(批量否定开关) 表示是否批量否定 “当前 deliveryTag 及之前的所有未确认消息”（批量拒绝）; 设为false仅否定 当前 deliveryTag 对应的单条消息（单条拒绝）
          // 示例：
          // 消费者当前未确认的消息 deliveryTag 为 3、4、5，调用 channel.nack(4, true, ...) → 否定 tag=3、4 的两条消息；
          // 调用 channel.nack(4, false, ...) → 仅否定 tag=4 的消息。
          // 使用场景：
          // 批量处理消息时（如一次性拉取 10 条），若其中一条处理失败，需批量拒绝所有未处理的消息（避免部分成功导致数据不一致）；
          // 单条消息处理失败时，用 multiple=false 精准拒绝。
          // ---------------------------------------------------------------
          // msg.requeue(消息重入队开关) 表示是否将否定的消息重新放回原队列，等待再次被消费
          // requeue=true：消息重新入队（默认放回队列尾部，若队列有优先级则按优先级排序），后续会被其他消费者（或当前消费者）重新处理；
          // requeue=false：消息不重新入队，后续处理逻辑由队列配置决定（若配置了死信交换机，则进入死信队列；否则直接丢弃）。
          // 使用场景：
          // requeue=true：临时故障（如数据库连接超时、网络波动），希望消息后续重试；
          // requeue=false：永久性故障（如消息格式错误、业务逻辑无法处理），无需重试，直接丢弃或入死信。
          channel.nack(msg, false, false);
          console.error(error);
        }
      },
      {
        // noAck: 表示是否自动确认消息，设置为true表示自动确认，设置为false表示手动确认
        // 如果设置为false，需要手动确认消息，否则消息会被重复消费。例如：channel.ack(msg)
        noAck: true,
      },
    );
  } catch (error) {
    console.log(error);
  }
})();
