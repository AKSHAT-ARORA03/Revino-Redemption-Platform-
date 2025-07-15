"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Voucher {
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
  createdAt: string
}

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    coinValue: "",
    expiryDate: "",
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/superadmin/vouchers")
      if (response.ok) {
        const data = await response.json()
        setVouchers(data)
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingVoucher ? `/api/superadmin/vouchers/${editingVoucher.id}` : "/api/superadmin/vouchers"

      const response = await fetch(url, {
        method: editingVoucher ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          coinValue: Number.parseInt(formData.coinValue),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Voucher ${editingVoucher ? "updated" : "created"} successfully`,
        })
        setDialogOpen(false)
        resetForm()
        fetchVouchers()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      title: voucher.title,
      description: voucher.description,
      category: voucher.category,
      coinValue: voucher.coinValue.toString(),
      expiryDate: voucher.expiryDate.split("T")[0],
      isActive: voucher.isActive,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return

    try {
      const response = await fetch(`/api/superadmin/vouchers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Voucher deleted successfully",
        })
        fetchVouchers()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete voucher",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      coinValue: "",
      expiryDate: "",
      isActive: true,
    })
    setEditingVoucher(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vouchers ({vouchers.length})</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? "Edit Voucher" : "Create New Voucher"}</DialogTitle>
              <DialogDescription>
                {editingVoucher ? "Update voucher details" : "Add a new voucher to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinValue">Coin Value</Label>
                <Input
                  id="coinValue"
                  type="number"
                  value={formData.coinValue}
                  onChange={(e) => setFormData({ ...formData, coinValue: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : editingVoucher ? "Update Voucher" : "Create Voucher"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{voucher.title}</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(voucher)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(voucher.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>{voucher.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm">{voucher.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coin Value:</span>
                  <Badge variant="secondary">{voucher.coinValue} coins</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm">{new Date(voucher.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={voucher.isActive ? "default" : "secondary"}>
                    {voucher.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
