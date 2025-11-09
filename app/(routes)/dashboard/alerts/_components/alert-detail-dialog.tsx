"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type RealtimeAlert } from '@/lib/supabase';
import { Brain, Sparkles, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlertDetailDialogProps {
  alert: RealtimeAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailDialog({ alert, open, onOpenChange }: AlertDetailDialogProps) {
  if (!alert) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Crítica</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500 text-xs">Media</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Baja</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Desconocida</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse LLM recommendations if available
  let llmRecommendations: string[] = [];
  if (alert.llm_recommendations) {
    try {
      llmRecommendations = JSON.parse(alert.llm_recommendations);
    } catch (error) {
      console.error('Error parsing LLM recommendations:', error);
    }
  }

  const hasLLMDiagnosis = !!alert.llm_diagnosis;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasLLMDiagnosis && <Brain className="h-5 w-5 text-purple-500" />}
            Detalle de Alerta: {alert.vehicle_id}
          </DialogTitle>
          <DialogDescription>
            {formatDate(alert.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Alert Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo de Alerta:</span>
                <Badge variant="outline">{alert.alert_type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severidad Original:</span>
                {getSeverityBadge(alert.severity)}
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Descripción:</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Recomendación:</p>
                <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* LLM Diagnosis Section */}
          {hasLLMDiagnosis && (
            <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Diagnóstico del Mecánico Experto (IA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* LLM Severity */}
                {alert.llm_severity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Severidad Evaluada por IA:</span>
                    {getSeverityBadge(alert.llm_severity)}
                  </div>
                )}

                {/* LLM Diagnosis */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Análisis Detallado:
                  </p>
                  <p className="text-sm leading-relaxed bg-white dark:bg-gray-950 p-3 rounded-md border">
                    {alert.llm_diagnosis}
                  </p>
                </div>

                {/* LLM Recommendations */}
                {llmRecommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Recomendaciones Accionables:
                    </p>
                    <ul className="space-y-2">
                      {llmRecommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex gap-2 items-start">
                          <span className="text-purple-500 font-bold">•</span>
                          <span className="flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* LLM Metadata */}
                <Separator />
                <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                  {alert.llm_tokens && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{alert.llm_tokens} tokens</span>
                    </div>
                  )}
                  {alert.llm_cost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${parseFloat(alert.llm_cost).toFixed(4)}</span>
                    </div>
                  )}
                  {alert.llm_cached !== null && (
                    <div className="flex items-center gap-1">
                      <span className={alert.llm_cached ? 'text-green-500' : 'text-gray-500'}>
                        {alert.llm_cached ? '✓ Cached' : '✗ No cache'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No LLM Diagnosis Message */}
          {!hasLLMDiagnosis && (
            <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-900/20">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground text-center">
                  Esta alerta fue generada antes de la integración con IA o el diagnóstico inteligente falló.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
