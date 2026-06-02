import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // Create salon
  const salon = await prisma.salon.create({
    data: {
      name: "Glamour Studio",
      slug: "glamour-studio",
      email: "hello@glamourstudio.com",
      phone: "+1 555 100 2000",
      address: "123 Beauty Ave",
      city: "Miami",
      country: "US",
      description: "Premium beauty salon in the heart of Miami",
    },
  });

  // Create staff
  const owner = await prisma.staffMember.create({
    data: {
      salonId: salon.id,
      email: "maria@glamourstudio.com",
      password,
      firstName: "Maria",
      lastName: "Garcia",
      phone: "+1 555 100 2001",
      role: "OWNER",
      bio: "Salon owner with 15 years of experience",
    },
  });

  const stylist1 = await prisma.staffMember.create({
    data: {
      salonId: salon.id,
      email: "jessica@glamourstudio.com",
      password,
      firstName: "Jessica",
      lastName: "Martinez",
      phone: "+1 555 100 2002",
      role: "STYLIST",
      bio: "Color specialist and balayage expert",
    },
  });

  const stylist2 = await prisma.staffMember.create({
    data: {
      salonId: salon.id,
      email: "carlos@glamourstudio.com",
      password,
      firstName: "Carlos",
      lastName: "Rivera",
      phone: "+1 555 100 2003",
      role: "STYLIST",
      bio: "Men's cuts and beard styling",
    },
  });

  // Create schedules for all staff
  for (const staff of [owner, stylist1, stylist2]) {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      await prisma.staffSchedule.create({
        data: {
          staffId: staff.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
        },
      });
    }
  }

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: { salonId: salon.id, name: "Women's Haircut", description: "Wash, cut, and blowdry", duration: 60, price: 75, category: "Hair", color: "#d946ef" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Men's Haircut", description: "Classic or modern cut", duration: 30, price: 35, category: "Hair", color: "#8b5cf6" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Balayage", description: "Hand-painted highlights", duration: 120, price: 200, category: "Color", color: "#f59e0b" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Full Color", description: "Root to tip single process", duration: 90, price: 150, category: "Color", color: "#ef4444" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Blowout", description: "Wash and styled blowdry", duration: 45, price: 55, category: "Hair", color: "#ec4899" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Manicure", description: "Classic manicure with polish", duration: 30, price: 30, category: "Nails", color: "#14b8a6" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Gel Nails", description: "Long-lasting gel polish", duration: 45, price: 50, category: "Nails", color: "#06b6d4" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Facial Treatment", description: "Deep cleansing facial", duration: 60, price: 85, category: "Skin", color: "#22c55e" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Beard Trim", description: "Shape and trim", duration: 20, price: 20, category: "Hair", color: "#64748b" },
    }),
    prisma.service.create({
      data: { salonId: salon.id, name: "Bridal Package", description: "Hair, makeup, and nails", duration: 180, price: 350, category: "Makeup", color: "#f472b6" },
    }),
  ]);

  // Assign services to staff
  await prisma.serviceStaff.createMany({
    data: [
      { serviceId: services[0].id, staffId: owner.id },
      { serviceId: services[0].id, staffId: stylist1.id },
      { serviceId: services[1].id, staffId: owner.id },
      { serviceId: services[1].id, staffId: stylist2.id },
      { serviceId: services[2].id, staffId: stylist1.id },
      { serviceId: services[3].id, staffId: stylist1.id },
      { serviceId: services[4].id, staffId: owner.id },
      { serviceId: services[4].id, staffId: stylist1.id },
      { serviceId: services[5].id, staffId: owner.id },
      { serviceId: services[6].id, staffId: owner.id },
      { serviceId: services[7].id, staffId: stylist1.id },
      { serviceId: services[8].id, staffId: stylist2.id },
      { serviceId: services[9].id, staffId: owner.id },
      { serviceId: services[9].id, staffId: stylist1.id },
    ],
  });

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({ data: { salonId: salon.id, firstName: "Sofia", lastName: "Lopez", phone: "+1 555 200 0001", email: "sofia@email.com", source: "online" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "Ana", lastName: "Torres", phone: "+1 555 200 0002", email: "ana@email.com", source: "walk-in" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "David", lastName: "Chen", phone: "+1 555 200 0003", email: "david@email.com", source: "whatsapp" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "Emma", lastName: "Wilson", phone: "+1 555 200 0004", email: "emma@email.com", source: "online" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "Lucas", lastName: "Brown", phone: "+1 555 200 0005", source: "phone" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "Isabella", lastName: "Reyes", phone: "+1 555 200 0006", email: "isabella@email.com", source: "online" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "James", lastName: "Park", phone: "+1 555 200 0007", source: "walk-in" } }),
    prisma.client.create({ data: { salonId: salon.id, firstName: "Valentina", lastName: "Morales", phone: "+1 555 200 0008", email: "val@email.com", tags: "VIP,regular", source: "online" } }),
  ]);

  // Create appointments (mix of past and upcoming)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await Promise.all([
    // Past completed
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[0].id, staffId: owner.id, serviceId: services[0].id,
        date: new Date(today.getTime() - 7 * 86400000), startTime: "10:00", endTime: "11:00",
        status: "COMPLETED", price: 75, source: "ONLINE",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[1].id, staffId: stylist1.id, serviceId: services[2].id,
        date: new Date(today.getTime() - 5 * 86400000), startTime: "14:00", endTime: "16:00",
        status: "COMPLETED", price: 200, source: "ONLINE",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[2].id, staffId: stylist2.id, serviceId: services[1].id,
        date: new Date(today.getTime() - 3 * 86400000), startTime: "11:00", endTime: "11:30",
        status: "COMPLETED", price: 35, source: "WALK_IN",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[3].id, staffId: stylist1.id, serviceId: services[3].id,
        date: new Date(today.getTime() - 2 * 86400000), startTime: "09:00", endTime: "10:30",
        status: "COMPLETED", price: 150, source: "ONLINE",
      },
    }),
    // Today
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[4].id, staffId: stylist2.id, serviceId: services[8].id,
        date: today, startTime: "10:00", endTime: "10:20",
        status: "CONFIRMED", price: 20, source: "PHONE",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[5].id, staffId: owner.id, serviceId: services[0].id,
        date: today, startTime: "14:00", endTime: "15:00",
        status: "CONFIRMED", price: 75, source: "ONLINE",
      },
    }),
    // Upcoming
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[6].id, staffId: stylist2.id, serviceId: services[1].id,
        date: new Date(today.getTime() + 1 * 86400000), startTime: "11:00", endTime: "11:30",
        status: "PENDING", price: 35, source: "ONLINE",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[7].id, staffId: stylist1.id, serviceId: services[2].id,
        date: new Date(today.getTime() + 2 * 86400000), startTime: "10:00", endTime: "12:00",
        status: "CONFIRMED", price: 200, source: "WHATSAPP",
      },
    }),
    prisma.appointment.create({
      data: {
        salonId: salon.id, clientId: clients[0].id, staffId: owner.id, serviceId: services[4].id,
        date: new Date(today.getTime() + 3 * 86400000), startTime: "16:00", endTime: "16:45",
        status: "PENDING", price: 55, source: "ONLINE",
      },
    }),
  ]);

  // Create reviews for completed appointments
  await Promise.all([
    prisma.review.create({
      data: {
        salonId: salon.id, clientId: clients[0].id, staffId: owner.id,
        appointmentId: appointments[0].id, rating: 5,
        comment: "Maria is amazing! Best haircut I've ever had. Will definitely be back!",
      },
    }),
    prisma.review.create({
      data: {
        salonId: salon.id, clientId: clients[1].id, staffId: stylist1.id,
        appointmentId: appointments[1].id, rating: 5,
        comment: "Jessica's balayage is incredible. So natural looking!",
        response: "Thank you Ana! So glad you love it!",
      },
    }),
    prisma.review.create({
      data: {
        salonId: salon.id, clientId: clients[2].id, staffId: stylist2.id,
        appointmentId: appointments[2].id, rating: 4,
        comment: "Great quick cut. Carlos knows what he's doing.",
      },
    }),
    prisma.review.create({
      data: {
        salonId: salon.id, clientId: clients[3].id, staffId: stylist1.id,
        appointmentId: appointments[3].id, rating: 5,
        comment: "The color came out perfect! Exactly what I wanted.",
      },
    }),
  ]);

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: { salonId: salon.id, type: "NEW_BOOKING", title: "New Online Booking", message: "James Park booked Men's Haircut with Carlos for tomorrow at 11:00 AM" },
    }),
    prisma.notification.create({
      data: { salonId: salon.id, type: "REVIEW", title: "New 5-Star Review", message: "Sofia Lopez left a 5-star review: 'Maria is amazing!'" },
    }),
    prisma.notification.create({
      data: { salonId: salon.id, type: "NEW_BOOKING", title: "New WhatsApp Booking", message: "Valentina Morales booked Balayage with Jessica" },
    }),
    prisma.notification.create({
      data: { salonId: salon.id, type: "REMINDER", title: "Appointment Reminder Sent", message: "Reminder sent to Lucas Brown for today's 10:00 AM appointment" },
    }),
  ]);

  console.log("Seed complete!");
  console.log(`\nDemo login: maria@glamourstudio.com / password123`);
  console.log(`Public booking: http://localhost:3000/book/glamour-studio`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
