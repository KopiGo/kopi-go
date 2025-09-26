import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../app/generated/prisma';
// import bcrypt from 'bcrypt'; // Disarankan untuk keamanan!

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Coba cari di tabel Driver
    const driver = await prisma.driver.findUnique({
      where: { email: email },
    });

    if (driver) {
      // Verifikasi Password Driver
      // const isPasswordValid = await bcrypt.compare(password, driver.password);
      
      // ⚠️ TIDAK AMAN: Perbandingan teks biasa (sesuai permintaan Anda)
      const isPasswordValid = (password === driver.password);

      if (isPasswordValid) {
        // Login Driver Berhasil
        return NextResponse.json({
          message: 'Login successful',
          role: driver.role, // "driver"
          user: {
            id: driver.driver_id,
            name: driver.name,
            email: driver.email,
          }
        }, { status: 200 });
      }
    }

    // 2. Jika bukan Driver, coba cari di tabel Superadmin
    const superadmin = await prisma.superadmin.findUnique({
      where: { email: email },
    });

    if (superadmin) {
      // Verifikasi Password Superadmin
      // const isPasswordValid = await bcrypt.compare(password, superadmin.password);
      
      // ⚠️ TIDAK AMAN: Perbandingan teks biasa (sesuai permintaan Anda)
      const isPasswordValid = (password === superadmin.password);

      if (isPasswordValid) {
        // Login Superadmin Berhasil
        return NextResponse.json({
          message: 'Login successful',
          role: 'superadmin',
          user: {
            id: superadmin.admin_id,
            name: superadmin.name,
            email: superadmin.email,
          }
        }, { status: 200 });
      }
    }

    // 3. Kredensial tidak cocok di kedua tabel
    return NextResponse.json({ message: 'Invalid credentials. User not found or incorrect password.' }, { status: 401 });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}