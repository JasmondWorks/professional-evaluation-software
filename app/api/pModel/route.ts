import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const task = searchParams.get('task')
    const observed = searchParams.get('observed')
    const estimated = searchParams.get('estimated')
    const pearson = searchParams.get('pearson')
    const rating = searchParams.get('rating')
    const allowance = searchParams.get('allowance')

    if (task && observed && estimated && pearson && rating && allowance) {
        return NextResponse.json({
            task: parseInt(task),
            observed: parseFloat(observed),
            estimated: parseFloat(estimated),
            pearson: parseFloat(pearson),
            rating: parseFloat(rating),
            allowance: parseFloat(allowance)
        })
    }
}