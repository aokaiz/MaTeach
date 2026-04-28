import { NextResponse } from 'next/server'
import pool from '@/lib/db'

interface EvaluateRequest {
  question_id: number
  question_title: string
  question_content: string
  question_options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: string
  student_answer: string
}

export async function POST(request: Request) {
  try {
    const body: EvaluateRequest = await request.json()
    const { question_title, question_content, question_options, correct_answer, student_answer } = body

    // 获取 AI 配置
    const configResult = await pool.query(
      'SELECT config_key, config_value FROM system_config WHERE config_key IN ($1, $2, $3, $4)',
      ['ai_base_url', 'ai_api_key', 'ai_model', 'ai_enabled']
    )

    const config: Record<string, string> = {}
    configResult.rows.forEach(row => {
      config[row.config_key] = row.config_value
    })

    // 检查是否启用 AI 评价
    if (config.ai_enabled !== 'true') {
      return NextResponse.json({
        success: true,
        evaluation: null,
        message: 'AI 评价功能未启用'
      })
    }

    // 获取 API 配置（优先使用数据库配置，否则使用环境变量）
    const baseURL = config.ai_base_url || process.env.AI_BASE_URL || 'https://api.openai.com/v1'
    const apiKey = config.ai_api_key || process.env.AI_API_KEY
    const model = config.ai_model || process.env.AI_MODEL || 'gpt-4o-mini'

    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 AI API Key' },
        { status: 500 }
      )
    }

    // 构建提示词
    const isCorrect = student_answer === correct_answer
    const prompt = `你是一位材料科学的教育专家。请对学生的一道选择题答案给出简短、鼓励性的个性化评价。

题目：${question_title}
题目内容：${question_content}
选项：
A. ${question_options.A}
B. ${question_options.B}
C. ${question_options.C}
D. ${question_options.D}
正确答案：${correct_answer}
学生答案：${student_answer}
学生答题结果：${isCorrect ? '正确' : '错误'}

请根据以下要求生成评价：
1. 如果回答正确：给予肯定和鼓励，可以适当扩展相关知识点
2. 如果回答错误：温和指出错误原因，解释正确答案，并给予鼓励
3. 评价要简短（中文字数控制在100字以内）
4. 使用鼓励性的语言，帮助学生建立学习信心
5. 可以适当提及材料科学相关的实际应用或趣味知识

请直接输出评价内容，不要加引号或其他格式标记。`

    // 调用 AI API
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一位热情、耐心的材料科学教育专家，善于用通俗易懂的语言解释专业知识。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      return NextResponse.json(
        { error: `AI 服务调用失败: ${response.status}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const evaluation = data.choices?.[0]?.message?.content?.trim() || '评价生成中...'

    return NextResponse.json({
      success: true,
      evaluation,
      isCorrect
    })
  } catch (error) {
    console.error('AI evaluation error:', error)
    return NextResponse.json(
      { error: 'AI 评价服务出错，请稍后重试' },
      { status: 500 }
    )
  }
}
