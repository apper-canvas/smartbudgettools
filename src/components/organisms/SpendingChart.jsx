import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ReactApexChart from "react-apexcharts"
import Card from "@/components/atoms/Card"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { transactionService } from "@/services/api/transactionService"
import { formatCurrency } from "@/utils/currency"

const SpendingChart = ({ type = "pie", title }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadChartData()
  }, [type])

  const loadChartData = async () => {
    try {
      setError("")
      const transactions = await transactionService.getAll()
      
      if (type === "pie") {
        generatePieChartData(transactions)
      } else if (type === "line") {
        generateLineChartData(transactions)
      }
    } catch (err) {
      console.error("Failed to load chart data:", err)
      setError("Failed to load chart data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generatePieChartData = (transactions) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const expenseTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return t.type === "expense" && 
             transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear
    })

    if (expenseTransactions.length === 0) {
      setChartData(null)
      return
    }

    const categoryTotals = {}
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })

    const series = Object.values(categoryTotals)
    const labels = Object.keys(categoryTotals)

    const options = {
      chart: {
        type: "pie",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800
        }
      },
      labels: labels,
      colors: ["#00875A", "#00B8D4", "#1890FF", "#FAAD14", "#F5222D", "#52C41A", "#722ED1", "#EB2F96"],
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val.toFixed(1) + "%"
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: "500"
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: "40%"
          },
          expandOnClick: false
        }
      },
      legend: {
        position: "bottom",
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        markers: {
          width: 8,
          height: 8,
          radius: 4
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return formatCurrency(val)
          }
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }]
    }

    setChartData({ series, options })
  }

  const generateLineChartData = (transactions) => {
    const months = []
    const currentDate = new Date()
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      })
    }

    const incomeData = months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
        return t.type === "income" && transactionMonth === month.key
      })
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    })

    const expenseData = months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
        return t.type === "expense" && transactionMonth === month.key
      })
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    })

    const series = [
      {
        name: "Income",
        data: incomeData,
        color: "#52C41A"
      },
      {
        name: "Expenses",
        data: expenseData,
        color: "#F5222D"
      }
    ]

    const options = {
      chart: {
        type: "line",
        height: 350,
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800
        },
        toolbar: {
          show: false
        }
      },
      stroke: {
        curve: "smooth",
        width: 3
      },
      xaxis: {
        categories: months.map(m => m.label),
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif"
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return formatCurrency(val)
          },
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif"
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return formatCurrency(val)
          }
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      },
      grid: {
        borderColor: "#f1f5f9"
      },
      legend: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif"
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        hover: {
          size: 6
        }
      }
    }

    setChartData({ series, options })
  }

  if (loading) {
    return <Loading message="Loading chart data..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadChartData} />
  }

  if (!chartData) {
    return (
      <Empty
        title="No data available"
        description="Add some transactions to see your spending visualization."
        actionLabel="Add Transaction"
        onAction={() => window.location.hash = "add-transaction"}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {title && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type={type}
          height={type === "pie" ? 350 : 400}
        />
      </Card>
    </motion.div>
  )
}

export default SpendingChart