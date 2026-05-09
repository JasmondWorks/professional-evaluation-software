import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

/**
 * API route to get statistics for the dashboard.
 * Returns the count of unique pesuser_name and org across all tables.
*/

export async function GET(req: NextRequest) {
    try {
        // Get unique pesuser_name count across all tables
        const pesuser_nameResult = await prisma.$queryRawUnsafe<{ count: number }[]>(`
            SELECT COUNT(DISTINCT pesuser_name) as count FROM (
                SELECT pesuser_name FROM appraisal
                UNION
                SELECT pesuser_name FROM userperformance
                UNION
                SELECT pesuser_name FROM stress
            ) AS all_pesuser_names
        `)
        console.log('pesuser_nameResult:', Number(pesuser_nameResult[0]?.count))
        const pesuser_nameCount = Number(pesuser_nameResult[0]?.count) || 0

        // Get unique org count across all tables
        const orgResult = await prisma.$queryRawUnsafe<{ count: number }[]>(`
            SELECT COUNT(DISTINCT org) as count FROM (
                SELECT org FROM appraisal
                UNION
                SELECT org FROM userperformance
                UNION
                SELECT org FROM stress
            ) AS all_orgs
        `)
        console.log('orgResult:', Number(orgResult[0]?.count))
        const organizationCount = Number(orgResult[0]?.count) || 0

        return NextResponse.json({
            pesuser_nameCount,
            organizationCount,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
