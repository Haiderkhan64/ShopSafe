import {
  PrismaClient,
  UserRole,
  OrderStatus,
  PaymentMethod,
  TransactionStatus,
  User,
  Product,
  Order,
  OrderItem,
  Transaction,
  Prisma,
} from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Starting database seeding...");

  // Clear existing data
  await clearDatabase();

  // Seed users
  const users = await seedUsers();
  console.log(`Created ${users.length} users`);

  // Seed products
  const products = await seedProducts();
  console.log(`Created ${products.length} products`);

  // Seed orders and related data
  const { orders, orderItems, transactions } = await seedOrders(
    users,
    products
  );
  console.log(
    `Created ${orders.length} orders with ${orderItems.length} items and ${transactions.length} transactions`
  );

  // Seed fraud flags for some transactions
  const fraudFlags = await seedFraudFlags(transactions);
  console.log(`Created ${fraudFlags.length} fraud flags`);

  // Seed data warehouse models
  const { userDims, productDims, timeDims, salesFacts } =
    await seedDataWarehouse(users, products, transactions);
  console.log(
    `Created data warehouse dimensions and ${salesFacts.length} sales facts`
  );

  // Seed sessions
  const sessions = await seedSessions(users);
  console.log(`Created ${sessions.length} user sessions`);

  // Seed system configuration
  const configs = await seedSystemConfig();
  console.log(`Created ${configs.length} system configurations`);

  // Seed transaction logs
  const transactionLogs = await seedTransactionLogs(transactions);
  console.log(`Created ${transactionLogs.length} transaction logs`);

  console.log("Database seeding completed successfully");
}

async function clearDatabase(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.transactionLog.deleteMany({});
  await prisma.systemConfig.deleteMany({});
  await prisma.salesFact.deleteMany({});
  await prisma.timeDim.deleteMany({});
  await prisma.productDim.deleteMany({});
  await prisma.userDim.deleteMany({});
  await prisma.fraudFlag.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedUsers(): Promise<User[]> {
  const saltRounds = 10;

  // Create an admin user
  const adminPassword = await hash("admin123", saltRounds);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Create an analyst user
  const analystPassword = await hash("analyst123", saltRounds);
  const analyst = await prisma.user.create({
    data: {
      email: "analyst@example.com",
      password: analystPassword,
      name: "Data Analyst",
      role: UserRole.ANALYST,
      isActive: true,
    },
  });

  // Create multiple customer users
  const customerData = [
    {
      email: "john@example.com",
      name: "John Doe",
      address: "123 Main St, New York, NY 10001",
    },
    {
      email: "jane@example.com",
      name: "Jane Smith",
      address: "456 Broadway, Boston, MA 02115",
    },
    {
      email: "alex@example.com",
      name: "Alex Johnson",
      address: "789 Oak Dr, San Francisco, CA 94107",
    },
    {
      email: "maria@example.com",
      name: "Maria Garcia",
      address: "101 Pine St, Miami, FL 33101",
    },
    {
      email: "sam@example.com",
      name: "Sam Wilson",
      address: "234 Elm St, Chicago, IL 60007",
    },
  ];

  const customerPassword = await hash("customer123", saltRounds);

  const customers = await Promise.all(
    customerData.map((data) =>
      prisma.user.create({
        data: {
          ...data,
          password: customerPassword,
          role: UserRole.CUSTOMER,
          isActive: true,
        },
      })
    )
  );

  return [admin, analyst, ...customers];
}

async function seedProducts(): Promise<Product[]> {
  const productData = [
    {
      name: "Wireless Headphones",
      description: "Premium noise-cancelling wireless headphones",
      price: 199.99,
      category: "Electronics",
      stock: 100,
    },
    {
      name: "Smartphone",
      description: "Latest model with advanced camera features",
      price: 899.99,
      category: "Electronics",
      stock: 50,
    },
    {
      name: "Running Shoes",
      description: "Lightweight running shoes with cushioned soles",
      price: 129.99,
      category: "Sports",
      stock: 75,
    },
    {
      name: "Coffee Maker",
      description: "Programmable coffee maker with thermal carafe",
      price: 79.99,
      category: "Home",
      stock: 60,
    },
    {
      name: "Laptop",
      description: "High-performance laptop for work and gaming",
      price: 1299.99,
      category: "Electronics",
      stock: 30,
    },
    {
      name: "Fitness Tracker",
      description: "Water-resistant fitness tracker with heart rate monitor",
      price: 89.99,
      category: "Wearables",
      stock: 120,
    },
    {
      name: "Desk Chair",
      description: "Ergonomic office chair with lumbar support",
      price: 249.99,
      category: "Furniture",
      stock: 25,
    },
    {
      name: "Blender",
      description: "High-speed blender for smoothies and soups",
      price: 149.99,
      category: "Kitchen",
      stock: 45,
    },
  ];

  return await Promise.all(
    productData.map((data) =>
      prisma.product.create({
        data: {
          sanityId: `sanity-${Math.random().toString(36).substring(2, 10)}`,
          ...data,
        },
      })
    )
  );
}

interface OrderResult {
  orders: Order[];
  orderItems: OrderItem[];
  transactions: Transaction[];
}

async function seedOrders(
  users: User[],
  products: Product[]
): Promise<OrderResult> {
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const transactions: Transaction[] = [];

  // Only consider customer users for orders
  const customers = users.filter(
    (user) => user.role === UserRole.ADMIN || user.role === UserRole.CUSTOMER
  );

  // Create 1-3 orders for each customer
  for (const customer of customers) {
    const numberOfOrders = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numberOfOrders; i++) {
      // Create order
      const orderStatus = getRandomOrderStatus();
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          status: orderStatus,
          total: 0, // Will be updated after adding items
        },
      });
      orders.push(order);

      // Add 1-4 random products to the order
      const numberOfItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = getRandomSubset(products, numberOfItems);
      let orderTotal = 0;

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemPrice = Number(product.price);
        const totalItemPrice = quantity * itemPrice;
        orderTotal += totalItemPrice;

        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity,
            price: itemPrice,
          },
        });
        orderItems.push(orderItem);
      }

      // Update order total
      await prisma.order.update({
        where: { id: order.id },
        data: { total: orderTotal },
      });

      // Create transaction for the order
      const paymentMethod = getRandomPaymentMethod();
      const transactionStatus =
        orderStatus === OrderStatus.CANCELLED
          ? TransactionStatus.FAILED
          : orderStatus === OrderStatus.REFUNDED
            ? TransactionStatus.REFUNDED
            : orderStatus === OrderStatus.COMPLETED
              ? TransactionStatus.COMPLETED
              : TransactionStatus.PENDING;

      const transaction = await prisma.transaction.create({
        data: {
          orderId: order.id,
          amount: orderTotal,
          paymentMethod,
          status: transactionStatus,
          metadata: {
            cardLast4:
              paymentMethod === PaymentMethod.CREDIT_CARD
                ? `${Math.floor(1000 + Math.random() * 9000)}`
                : null,
            paypalEmail:
              paymentMethod === PaymentMethod.PAYPAL ? customer.email : null,
            bankAccount:
              paymentMethod === PaymentMethod.BANK_TRANSFER
                ? `${Math.floor(10000000 + Math.random() * 90000000)}`
                : null,
            walletAddress:
              paymentMethod === PaymentMethod.CRYPTO
                ? `0x${Math.random().toString(16).substring(2, 42)}`
                : null,
          } as Prisma.JsonObject,
        },
      });
      transactions.push(transaction);
    }
  }

  return { orders, orderItems, transactions };
}

async function seedFraudFlags(transactions: Transaction[]) {
  const fraudFlags = [];

  // Flag approximately 10% of transactions as suspicious
  const transactionsToFlag = getRandomSubset(
    transactions,
    Math.ceil(transactions.length * 0.1)
  );

  for (const transaction of transactionsToFlag) {
    const riskScore = 0.7 + Math.random() * 0.3; // High risk score between 0.7 and 1.0
    const isConfirmedFraud = Math.random() > 0.7; // Some are confirmed fraud

    const fraudFlag = await prisma.fraudFlag.create({
      data: {
        transactionId: transaction.id,
        riskScore,
        flagged: true,
        isConfirmedFraud,
        source: "ML_MODEL",
        reviewNotes: isConfirmedFraud
          ? "Confirmed fraudulent transaction"
          : "Suspicious activity detected",
      },
    });
    fraudFlags.push(fraudFlag);
  }

  // Add some low risk scores to other transactions (not flagged)
  const lowRiskTransactions = getRandomSubset(
    transactions.filter((t) => !transactionsToFlag.includes(t)),
    Math.ceil(transactions.length * 0.2)
  );

  for (const transaction of lowRiskTransactions) {
    const riskScore = Math.random() * 0.3; // Low risk score between 0 and 0.3

    const fraudFlag = await prisma.fraudFlag.create({
      data: {
        transactionId: transaction.id,
        riskScore,
        flagged: false,
        isConfirmedFraud: false,
        source: "ML_MODEL",
      },
    });
    fraudFlags.push(fraudFlag);
  }

  return fraudFlags;
}

interface DataWarehouseResult {
  userDims: any[];
  productDims: any[];
  timeDims: any[];
  salesFacts: any[];
}

async function seedDataWarehouse(
  users: User[],
  products: Product[],
  transactions: Transaction[]
): Promise<DataWarehouseResult> {
  // Create UserDim entries
  const userDims = await Promise.all(
    users.map((user) =>
      prisma.userDim.create({
        data: {
          userId: user.id,
          email: user.email,
          name: user.name || "",
          region: getRegionFromAddress(user.address),
          userType: user.role,
        },
      })
    )
  );

  // Create ProductDim entries
  const productDims = await Promise.all(
    products.map((product) =>
      prisma.productDim.create({
        data: {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
        },
      })
    )
  );

  // Create TimeDim entries for the last 30 days
  const timeDims = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const timeDim = await prisma.timeDim.create({
      data: {
        timestamp: date,
        day,
        month,
        quarter: Math.ceil(month / 3),
        year,
        isWeekend,
        isHoliday: false, // Would require a holiday calendar to determine
      },
    });
    timeDims.push(timeDim);
  }

  // Create SalesFact entries
  const salesFacts = [];

  for (const transaction of transactions) {
    if (transaction.status !== TransactionStatus.COMPLETED) continue;

    // Get related order and user
    const order = await prisma.order.findUnique({
      where: { id: transaction.orderId },
      include: { items: { include: { product: true } } },
    });

    // Get dimension IDs
    const userDim = order
      ? userDims.find((ud) => ud.userId === order.userId)
      : null;

    // Use a random date from our time dimensions
    const randomTimeDim = getRandomElement(timeDims);

    // Create a sales fact for each product in the order
    if (order) {
      for (const item of order.items) {
        const productDim = productDims.find(
          (pd) => pd.productId === item.productId
        );

        if (userDim && productDim) {
          const salesFact = await prisma.salesFact.create({
            data: {
              transactionId: `${transaction.id}-${item.id}`, // Composite to allow multiple items per transaction
              userId: order.userId,
              productId: item.productId,
              amount: Number(item.price) * item.quantity,
              timestamp: randomTimeDim.timestamp,
              userDimId: userDim.id,
              productDimId: productDim.id,
              timeDimId: randomTimeDim.id,
            },
          });
          salesFacts.push(salesFact);
        }
      }
    }
  }

  return { userDims, productDims, timeDims, salesFacts };
}

async function seedSessions(users: User[]) {
  const sessions = [];

  for (const user of users) {
    const numberOfSessions = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numberOfSessions; i++) {
      const startTime = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ); // Random time in the last 30 days
      const duration = Math.floor(Math.random() * 3600); // Between 0 and 3600 seconds
      const endTime = new Date(startTime.getTime() + duration * 1000);

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          deviceInfo: {
            browser: getRandomBrowser(),
            os: getRandomOS(),
            deviceType: getRandomDeviceType(),
          } as Prisma.JsonObject,
          ipAddress: generateRandomIP(),
          userAgent: generateRandomUserAgent(),
          startTime,
          endTime,
          duration,
          isActive: false,
        },
      });
      sessions.push(session);
    }

    // Add one active session for some users
    if (Math.random() > 0.5) {
      const activeSession = await prisma.session.create({
        data: {
          userId: user.id,
          deviceInfo: {
            browser: getRandomBrowser(),
            os: getRandomOS(),
            deviceType: getRandomDeviceType(),
          } as Prisma.JsonObject,
          ipAddress: generateRandomIP(),
          userAgent: generateRandomUserAgent(),
          startTime: new Date(
            Date.now() - Math.floor(Math.random() * 3600) * 1000
          ), // Started within the last hour
          endTime: null,
          duration: null,
          isActive: true,
        },
      });
      sessions.push(activeSession);
    }
  }

  return sessions;
}

async function seedSystemConfig() {
  const configEntries = [
    {
      key: "FRAUD_DETECTION_THRESHOLD",
      value: "0.7",
      description: "Risk score threshold for flagging transactions as fraud",
    },
    {
      key: "EMAIL_NOTIFICATIONS",
      value: "true",
      description: "Enable email notifications for high-risk transactions",
    },
    {
      key: "MAX_LOGIN_ATTEMPTS",
      value: "5",
      description: "Maximum login attempts before account lockout",
    },
    {
      key: "SESSION_TIMEOUT",
      value: "3600",
      description: "Session timeout in seconds",
    },
    {
      key: "MAINTENANCE_MODE",
      value: "false",
      description: "Enable maintenance mode",
    },
  ];

  return await Promise.all(
    configEntries.map((entry) =>
      prisma.systemConfig.create({
        data: {
          ...entry,
          updatedBy: "system",
        },
      })
    )
  );
}

async function seedTransactionLogs(transactions: Transaction[]) {
  const logs = [];

  for (const transaction of transactions) {
    // Create a log for transaction creation
    const createLog = await prisma.transactionLog.create({
      data: {
        transactionId: transaction.id,
        action: "INSERT",
        oldValues: {} as Prisma.JsonObject, // Empty object instead of null
        newValues: {
          id: transaction.id,
          orderId: transaction.orderId,
          amount: Number(transaction.amount),
          paymentMethod: transaction.paymentMethod,
          status: transaction.status,
        } as Prisma.JsonObject,
        userId: "system",
        timestamp: transaction.timestamp,
      },
    });
    logs.push(createLog);

    // Create update logs for some transactions
    if (Math.random() > 0.7) {
      const oldStatus = transaction.status;
      const newStatus =
        oldStatus === TransactionStatus.PENDING
          ? TransactionStatus.COMPLETED
          : oldStatus === TransactionStatus.COMPLETED
            ? TransactionStatus.REFUNDED
            : oldStatus;

      if (oldStatus !== newStatus) {
        const updateLog = await prisma.transactionLog.create({
          data: {
            transactionId: transaction.id,
            action: "UPDATE",
            oldValues: {
              status: oldStatus,
            } as Prisma.JsonObject,
            newValues: {
              status: newStatus,
            } as Prisma.JsonObject,
            userId: "admin",
            timestamp: new Date(
              transaction.timestamp.getTime() + 24 * 60 * 60 * 1000
            ), // 1 day later
          },
        });
        logs.push(updateLog);
      }
    }
  }

  return logs;
}

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSubset<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

function getRandomOrderStatus(): OrderStatus {
  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ];
  const weights = [0.1, 0.2, 0.5, 0.1, 0.1]; // Higher probability for COMPLETED

  const random = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return statuses[i];
    }
  }

  return OrderStatus.COMPLETED;
}

function getRandomPaymentMethod(): PaymentMethod {
  const methods = [
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.PAYPAL,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CRYPTO,
  ];
  const weights = [0.6, 0.2, 0.15, 0.05]; // Higher probability for CREDIT_CARD

  const random = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < methods.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return methods[i];
    }
  }

  return PaymentMethod.CREDIT_CARD;
}

function getRegionFromAddress(address: string | null): string | null {
  if (!address) return null;

  if (address.includes("NY")) return "Northeast";
  if (address.includes("MA")) return "Northeast";
  if (address.includes("CA")) return "West";
  if (address.includes("FL")) return "Southeast";
  if (address.includes("IL")) return "Midwest";

  return "Unknown";
}

function getRandomBrowser(): string {
  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  return getRandomElement(browsers);
}

function getRandomOS(): string {
  const os = ["Windows", "MacOS", "iOS", "Android", "Linux"];
  return getRandomElement(os);
}

function getRandomDeviceType(): string {
  const deviceTypes = ["Desktop", "Laptop", "Tablet", "Mobile"];
  return getRandomElement(deviceTypes);
}

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateRandomUserAgent(): string {
  const browsers = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  ];
  return getRandomElement(browsers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
