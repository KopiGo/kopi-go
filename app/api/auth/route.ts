import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
// import bcrypt from 'bcrypt'; // Disarankan untuk keamanan!

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log('Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Coba cari di tabel Driver
    console.log('Looking for driver with email:', email);
    const driver = await prisma.driver.findUnique({
      where: { email: email },
    });
    
    console.log('Driver found:', driver ? 'Yes' : 'No');

    if (driver) {
      console.log('Driver data:', { 
        id: driver.driver_id, 
        name: driver.name, 
        email: driver.email,
        passwordMatch: password === driver.password 
      });
      
      // Verifikasi Password Driver
      // const isPasswordValid = await bcrypt.compare(password, driver.password);
      
      // ⚠️ TIDAK AMAN: Perbandingan teks biasa (sesuai permintaan Anda)
      const isPasswordValid = (password === driver.password);

      if (isPasswordValid) {
        console.log('Driver login successful');
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
    console.log('Looking for superadmin with email:', email);
    const superadmin = await prisma.superadmin.findUnique({
      where: { email: email },
    });
    
    console.log('Superadmin found:', superadmin ? 'Yes' : 'No');

    if (superadmin) {
      console.log('Superadmin data:', { 
        id: superadmin.admin_id, 
        name: superadmin.name, 
        email: superadmin.email,
        passwordMatch: password === superadmin.password 
      });
      
      // Verifikasi Password Superadmin
      // const isPasswordValid = await bcrypt.compare(password, superadmin.password);
      
      // ⚠️ TIDAK AMAN: Perbandingan teks biasa (sesuai permintaan Anda)
      const isPasswordValid = (password === superadmin.password);

      if (isPasswordValid) {
        console.log('Superadmin login successful');
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
    console.log('Invalid credentials - no match found');
    return NextResponse.json({ message: 'Invalid credentials. User not found or incorrect password.' }, { status: 401 });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}