"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Error Boundary para capturar errores de Three.js
class ModelErrorBoundary extends React.Component<
    { children: React.ReactNode; onError: (error: string) => void },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; onError: (error: string) => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error('Error en modelo 3D:', error);
        this.props.onError(error.message || 'Error desconocido al cargar el modelo 3D');
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

// Componente interno para cargar el modelo GLB
function BusModel() {
    const gltf = useGLTF('/models/bus.glb');

    // Si no hay scene, no renderizar nada
    if (!gltf?.scene) {
        return null;
    }

    return (
        <primitive
            object={gltf.scene}
            scale={0.5}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
        />
    );
}

// Wrapper del BusModel que maneja los errores
function BusModelWithErrorHandling({ onError }: { onError: (error: string) => void }) {
    return (
        <ModelErrorBoundary onError={onError}>
            <BusModel />
        </ModelErrorBoundary>
    );
}

// Componente alternativo cuando no hay modelo 3D
function BusPlaceholder() {
    return (
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            {/* Cuerpo principal del bus */}
            <boxGeometry args={[3, 1.5, 1]} />
            <meshStandardMaterial color="#1e40af" />

            {/* Techo */}
            <mesh position={[0, 0.9, 0]}>
                <boxGeometry args={[2.8, 0.2, 0.9]} />
                <meshStandardMaterial color="#1e3a8a" />
            </mesh>

            {/* Ventanas */}
            <mesh position={[0.8, 0.3, 0.51]}>
                <boxGeometry args={[0.4, 0.6, 0.02]} />
                <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0.3, 0.51]}>
                <boxGeometry args={[0.4, 0.6, 0.02]} />
                <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.8, 0.3, 0.51]}>
                <boxGeometry args={[0.4, 0.6, 0.02]} />
                <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} />
            </mesh>

            {/* Ruedas */}
            <mesh position={[1, -0.9, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[1, -0.9, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[-1, -0.9, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[-1, -0.9, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
        </mesh>
    );
}

// Componente de loading mejorado
function ModelLoader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-sm text-slate-600 font-medium">Cargando modelo 3D...</p>
            <div className="mt-2 bg-slate-200 rounded-full h-2 w-48">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
        </div>
    );
}

// Componente de error mejorado
function ModelError({ onRetry, onUsePlaceholder, errorMessage }: {
    onRetry: () => void;
    onUsePlaceholder: () => void;
    errorMessage: string;
}) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 p-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Error al cargar el modelo 3D</h3>
            <p className="text-sm text-slate-600 mb-2 text-center max-w-md">
                {errorMessage}
            </p>
            <p className="text-xs text-slate-500 mb-4 text-center max-w-md">
                Asegúrate de que el archivo <code className="bg-slate-200 px-1 rounded">bus.glb</code> existe en <code className="bg-slate-200 px-1 rounded">/public/models/</code>
            </p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reintentar
                </Button>
                <Button onClick={onUsePlaceholder} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Usar Modelo Simple
                </Button>
            </div>
        </div>
    );
}

// Hook personalizado para verificar si el archivo existe
function useModelExists(modelPath: string) {
    const [exists, setExists] = useState<boolean | null>(null);

    useEffect(() => {
        fetch(modelPath, { method: 'HEAD' })
            .then(response => {
                setExists(response.ok);
            })
            .catch(() => {
                setExists(false);
            });
    }, [modelPath]);

    return exists;
}

// Componente principal del modelo 3D
export default function VehicleModel() {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [usePlaceholder, setUsePlaceholder] = useState(false);
    const [key, setKey] = useState(0);

    // Verificar si el modelo existe
    const modelExists = useModelExists('/models/bus.glb');

    const handleError = (message: string) => {
        setHasError(true);
        setErrorMessage(message);
    };

    const handleRetry = () => {
        setHasError(false);
        setErrorMessage('');
        setUsePlaceholder(false);
        setKey(prev => prev + 1);
    };

    const handleUsePlaceholder = () => {
        setHasError(false);
        setUsePlaceholder(true);
    };

    // Mostrar loading mientras verificamos si el archivo existe
    if (modelExists === null) {
        return (
            <Card className="fleetcare-card shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden h-full">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        Modelo 3D del Vehículo
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative">
                    <div className="h-80 w-full relative overflow-hidden rounded-b-lg">
                        <ModelLoader />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="fleetcare-card shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    Modelo 3D del Vehículo
                    {usePlaceholder && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Modelo Simple
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
                <div className="h-80 w-full relative overflow-hidden rounded-b-lg">
                    {hasError ? (
                        <ModelError
                            onRetry={handleRetry}
                            onUsePlaceholder={handleUsePlaceholder}
                            errorMessage={errorMessage}
                        />
                    ) : (
                        <Canvas
                            key={key}
                            camera={{
                                position: [4, 4, 4],
                                fov: 60
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 50%, #e2e8f0 100%)'
                            }}
                            onCreated={({ gl }) => {
                                gl.setClearColor('#f1f5f9', 1);
                            }}
                        >
                            {/* Iluminación optimizada */}
                            <ambientLight intensity={0.8} />
                            <directionalLight
                                position={[8, 8, 4]}
                                intensity={1}
                                castShadow
                                shadow-mapSize-width={1024}
                                shadow-mapSize-height={1024}
                            />
                            <pointLight position={[-8, -8, -8]} intensity={0.3} color="#b3d9ff" />
                            <spotLight
                                position={[0, 8, 0]}
                                intensity={0.4}
                                angle={Math.PI / 5}
                                penumbra={0.3}
                            />

                            {/* Modelo 3D o Placeholder */}
                            <Suspense fallback={null}>
                                {usePlaceholder || modelExists === false ? (
                                    <BusPlaceholder />
                                ) : (
                                    <BusModelWithErrorHandling onError={handleError} />
                                )}
                            </Suspense>

                            {/* Controles de órbita */}
                            <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                minDistance={2.5}
                                maxDistance={10}
                                autoRotate={false}
                                enableDamping={true}
                                dampingFactor={0.03}
                                maxPolarAngle={Math.PI / 1.6}
                                minPolarAngle={Math.PI / 8}
                            />
                        </Canvas>
                    )}
                </div>

                {/* Controles de información */}
                {!hasError && (
                    <div className="p-3 border-t bg-gradient-to-r from-slate-50 to-blue-50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">
                                🖱️ Rotar • 🔍 Zoom • ✋ Arrastrar
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-slate-500">
                                    {usePlaceholder ? 'Modelo Simple' : '3D Interactivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}