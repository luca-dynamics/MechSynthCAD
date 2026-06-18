"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyzeFourBar,
  analyzeSliderCrank,
  sweepFourBar,
  sweepSliderCrank,
} from "@/lib/api";
import type {
  FourBarAnalysisResult,
  FourBarForm,
  FourBarSweepResponse,
  MechanismType,
  SliderCrankAnalysisResult,
  SliderCrankForm,
  SliderCrankSweepForm,
  SliderCrankSweepResponse,
  SweepForm,
  SynthesisResponse,
} from "@/types";
import type { V2ActivityEvent, V2MechanismState } from "@/components/v2/types";
import {
  fourBarDemoParameters,
  fourBarDemoSweep,
  sliderCrankDemoParameters,
  sliderCrankDemoSweep,
} from "@/components/v2/missionTemplates";

type AppendActivity = (
  type: string,
  message: string,
  status: V2ActivityEvent["status"],
) => void;

export type V2MechanismSessionState = {
  selectedMechanism: MechanismType;
  fourBar: {
    form: FourBarForm;
    sweepForm: SweepForm;
    result: FourBarAnalysisResult | null;
    sweepResult: FourBarSweepResponse | null;
    selectedSampleIndex: number;
  };
  sliderCrank: {
    form: SliderCrankForm;
    sweepForm: SliderCrankSweepForm;
    result: SliderCrankAnalysisResult | null;
    sweepResult: SliderCrankSweepResponse | null;
    selectedSampleIndex: number;
  };
  latestSynthesisRecommendations: SynthesisResponse | null;
};

export function useV2MechanismRuntime(appendActivity: AppendActivity) {
  const [selectedMechanism, setSelectedMechanism] =
    useState<MechanismType>("four_bar");
  const [form, setForm] = useState<FourBarForm>(fourBarDemoParameters);
  const [sweepForm, setSweepForm] = useState<SweepForm>(fourBarDemoSweep);
  const [result, setResult] = useState<FourBarAnalysisResult | null>(null);
  const [sweepResult, setSweepResult] = useState<FourBarSweepResponse | null>(
    null,
  );
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderCrankForm, setSliderCrankForm] = useState<SliderCrankForm>(
    sliderCrankDemoParameters,
  );
  const [sliderCrankResult, setSliderCrankResult] =
    useState<SliderCrankAnalysisResult | null>(null);
  const [sliderCrankSweepForm, setSliderCrankSweepForm] =
    useState<SliderCrankSweepForm>(sliderCrankDemoSweep);
  const [sliderCrankSweepResult, setSliderCrankSweepResult] =
    useState<SliderCrankSweepResponse | null>(null);
  const [selectedSliderCrankSampleIndex, setSelectedSliderCrankSampleIndex] =
    useState(0);
  const [isSliderCrankPlaying, setIsSliderCrankPlaying] = useState(false);
  const [isSliderCrankSweeping, setIsSliderCrankSweeping] = useState(false);
  const [isSliderCrankLoading, setIsSliderCrankLoading] = useState(false);
  const [sliderCrankError, setSliderCrankError] = useState<string | null>(null);
  const [latestSynthesisRecommendations, setLatestSynthesisRecommendations] =
    useState<SynthesisResponse | null>(null);

  const displayResult = useFourBarDisplayResult(
    result,
    sweepResult,
    selectedSampleIndex,
  );
  const displaySliderCrankResult = useSliderCrankDisplayResult(
    sliderCrankResult,
    sliderCrankSweepResult,
    selectedSliderCrankSampleIndex,
    sliderCrankForm,
  );
  const solverResult =
    selectedMechanism === "four_bar"
      ? displayResult || result
      : displaySliderCrankResult;
  const currentSweepResult =
    selectedMechanism === "four_bar" ? sweepResult : sliderCrankSweepResult;
  const inputParameters =
    selectedMechanism === "four_bar" ? form : sliderCrankForm;
  const activeTask =
    isLoading || isSliderCrankLoading
      ? "analysis running"
      : isSweeping || isSliderCrankSweeping
        ? "simulation running"
        : solverResult
          ? "solver result ready"
          : "waiting for command";

  useEffect(() => {
    if (!isPlaying || !sweepResult?.samples.length) return;
    const interval = window.setInterval(
      () =>
        setSelectedSampleIndex(
          (index) => (index + 1) % sweepResult.samples.length,
        ),
      180,
    );
    return () => window.clearInterval(interval);
  }, [isPlaying, sweepResult]);

  useEffect(() => {
    if (!isSliderCrankPlaying || !sliderCrankSweepResult?.samples.length)
      return;
    const interval = window.setInterval(
      () =>
        setSelectedSliderCrankSampleIndex(
          (index) => (index + 1) % sliderCrankSweepResult.samples.length,
        ),
      180,
    );
    return () => window.clearInterval(interval);
  }, [isSliderCrankPlaying, sliderCrankSweepResult]);

  useEffect(() => {
    setIsPlaying(false);
    setIsSliderCrankPlaying(false);
    setLatestSynthesisRecommendations(null);
  }, [selectedMechanism]);

  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyzeFourBar(form);
      setResult(response);
      setSweepResult(null);
      setIsPlaying(false);
      return response as Record<string, unknown>;
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to run analysis";
      setError(message);
      setResult(null);
      appendActivity(
        "solver",
        `Solver error: ${message}. Check /api/health or deployment status.`,
        "error",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [appendActivity, form]);

  const runSliderCrankAnalysis = useCallback(async () => {
    setIsSliderCrankLoading(true);
    setSliderCrankError(null);
    try {
      const response = await analyzeSliderCrank(sliderCrankForm);
      setSliderCrankResult(response);
      setSliderCrankSweepResult(null);
      setIsSliderCrankPlaying(false);
      return response as Record<string, unknown>;
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to run slider-crank analysis";
      setSliderCrankError(message);
      setSliderCrankResult(null);
      appendActivity(
        "solver",
        `Solver error: ${message}. Check /api/health or deployment status.`,
        "error",
      );
      return null;
    } finally {
      setIsSliderCrankLoading(false);
    }
  }, [appendActivity, sliderCrankForm]);

  const runSweep = useCallback(async () => {
    setIsSweeping(true);
    setError(null);
    setIsPlaying(false);
    try {
      const response = await sweepFourBar({ ...form, ...sweepForm });
      setSweepResult(response);
      setSelectedSampleIndex(0);
      return response as Record<string, unknown>;
    } catch (sweepError) {
      const message =
        sweepError instanceof Error
          ? sweepError.message
          : "Unable to run simulation";
      setError(message);
      setSweepResult(null);
      appendActivity(
        "solver",
        `Sweep error: ${message}. Check /api/health or deployment status.`,
        "error",
      );
      return null;
    } finally {
      setIsSweeping(false);
    }
  }, [appendActivity, form, sweepForm]);

  const runSliderCrankSweep = useCallback(async () => {
    setIsSliderCrankSweeping(true);
    setSliderCrankError(null);
    setIsSliderCrankPlaying(false);
    try {
      const response = await sweepSliderCrank({
        ...sliderCrankForm,
        ...sliderCrankSweepForm,
      });
      setSliderCrankSweepResult(response);
      setSelectedSliderCrankSampleIndex(0);
      return response as Record<string, unknown>;
    } catch (sweepError) {
      const message =
        sweepError instanceof Error
          ? sweepError.message
          : "Unable to run slider-crank simulation";
      setSliderCrankError(message);
      setSliderCrankSweepResult(null);
      appendActivity(
        "solver",
        `Sweep error: ${message}. Check /api/health or deployment status.`,
        "error",
      );
      return null;
    } finally {
      setIsSliderCrankSweeping(false);
    }
  }, [appendActivity, sliderCrankForm, sliderCrankSweepForm]);

  const mechanismState: V2MechanismState = {
    selectedMechanism,
    setSelectedMechanism,
    form,
    setForm,
    sweepForm,
    setSweepForm,
    result,
    displayResult,
    sweepResult,
    selectedSampleIndex,
    setSelectedSampleIndex,
    isPlaying,
    setIsPlaying,
    isLoading,
    isSweeping,
    error,
    runAnalysis,
    runSweep,
    sliderCrankForm,
    setSliderCrankForm,
    sliderCrankSweepForm,
    setSliderCrankSweepForm,
    sliderCrankResult,
    displaySliderCrankResult,
    sliderCrankSweepResult,
    selectedSliderCrankSampleIndex,
    setSelectedSliderCrankSampleIndex,
    isSliderCrankPlaying,
    setIsSliderCrankPlaying,
    isSliderCrankLoading,
    isSliderCrankSweeping,
    sliderCrankError,
    runSliderCrankAnalysis,
    runSliderCrankSweep,
    inputParameters,
    solverResult: solverResult as Record<string, unknown> | null,
    sweepResultForReport: currentSweepResult as Record<string, unknown> | null,
    latestSynthesisRecommendations,
    setLatestSynthesisRecommendations,
  };

  const resetMechanismRuntime = useCallback(() => {
    setSelectedMechanism("four_bar");
    setForm(fourBarDemoParameters);
    setSweepForm(fourBarDemoSweep);
    setResult(null);
    setSweepResult(null);
    setSelectedSampleIndex(0);
    setIsPlaying(false);
    setError(null);
    setSliderCrankForm(sliderCrankDemoParameters);
    setSliderCrankSweepForm(sliderCrankDemoSweep);
    setSliderCrankResult(null);
    setSliderCrankSweepResult(null);
    setSelectedSliderCrankSampleIndex(0);
    setIsSliderCrankPlaying(false);
    setSliderCrankError(null);
    setLatestSynthesisRecommendations(null);
  }, []);

  const loadMissionTemplateMechanism = useCallback(
    (mechanism: MechanismType) => {
      if (mechanism === "four_bar") {
        setSelectedMechanism("four_bar");
        setForm(fourBarDemoParameters);
        setSweepForm(fourBarDemoSweep);
        setResult(null);
        setSweepResult(null);
        setSelectedSampleIndex(0);
      }
      if (mechanism === "slider_crank") {
        setSelectedMechanism("slider_crank");
        setSliderCrankForm(sliderCrankDemoParameters);
        setSliderCrankSweepForm(sliderCrankDemoSweep);
        setSliderCrankResult(null);
        setSliderCrankSweepResult(null);
        setSelectedSliderCrankSampleIndex(0);
      }
      setLatestSynthesisRecommendations(null);
    },
    [],
  );

  const buildMechanismSession = useCallback(
    (): V2MechanismSessionState => ({
      selectedMechanism,
      fourBar: { form, sweepForm, result, sweepResult, selectedSampleIndex },
      sliderCrank: {
        form: sliderCrankForm,
        sweepForm: sliderCrankSweepForm,
        result: sliderCrankResult,
        sweepResult: sliderCrankSweepResult,
        selectedSampleIndex: selectedSliderCrankSampleIndex,
      },
      latestSynthesisRecommendations,
    }),
    [
      form,
      latestSynthesisRecommendations,
      result,
      selectedMechanism,
      selectedSampleIndex,
      selectedSliderCrankSampleIndex,
      sliderCrankForm,
      sliderCrankResult,
      sliderCrankSweepForm,
      sliderCrankSweepResult,
      sweepForm,
      sweepResult,
    ],
  );

  const restoreMechanismSession = useCallback(
    (session: V2MechanismSessionState) => {
      setSelectedMechanism(session.selectedMechanism);
      setForm(session.fourBar.form);
      setSweepForm(session.fourBar.sweepForm);
      setResult(session.fourBar.result);
      setSweepResult(session.fourBar.sweepResult);
      setSelectedSampleIndex(session.fourBar.selectedSampleIndex);
      setSliderCrankForm(session.sliderCrank.form);
      setSliderCrankSweepForm(session.sliderCrank.sweepForm);
      setSliderCrankResult(session.sliderCrank.result);
      setSliderCrankSweepResult(session.sliderCrank.sweepResult);
      setSelectedSliderCrankSampleIndex(
        session.sliderCrank.selectedSampleIndex,
      );
      setLatestSynthesisRecommendations(session.latestSynthesisRecommendations);
      setIsPlaying(false);
      setIsSliderCrankPlaying(false);
      setError(null);
      setSliderCrankError(null);
    },
    [],
  );

  return {
    mechanismState,
    selectedMechanism,
    setSelectedMechanism,
    inputParameters,
    solverResult,
    activeTask,
    latestError: error ?? sliderCrankError,
    runAnalysis,
    runSliderCrankAnalysis,
    runSweep,
    runSliderCrankSweep,
    resetMechanismRuntime,
    loadMissionTemplateMechanism,
    buildMechanismSession,
    restoreMechanismSession,
  };
}

function useFourBarDisplayResult(
  result: FourBarAnalysisResult | null,
  sweepResult: FourBarSweepResponse | null,
  selectedSampleIndex: number,
) {
  return useMemo<FourBarAnalysisResult | null>(() => {
    const sample = sweepResult?.samples[selectedSampleIndex];
    if (!sample || !sweepResult) return result;
    return {
      mechanism: "four_bar_linkage",
      valid: sample.valid,
      grashof_status: sweepResult.grashof_status,
      mobility: sweepResult.mobility,
      classification: sweepResult.classification,
      theta2_deg: sample.theta2_deg,
      theta3_deg: sample.theta3_deg,
      theta4_deg: sample.theta4_deg,
      joint_coordinates: sample.joint_coordinates,
      velocity_analysis: sample.velocity_analysis,
      acceleration_analysis: sample.acceleration_analysis,
      notes: sample.notes,
    };
  }, [result, selectedSampleIndex, sweepResult]);
}

function useSliderCrankDisplayResult(
  result: SliderCrankAnalysisResult | null,
  sweepResult: SliderCrankSweepResponse | null,
  selectedSampleIndex: number,
  form: SliderCrankForm,
) {
  return useMemo<SliderCrankAnalysisResult | null>(() => {
    const sample = sweepResult?.samples[selectedSampleIndex];
    if (!sample) return result;
    return {
      mechanism: "slider_crank",
      valid: sample.valid,
      theta_deg: sample.theta_deg,
      crank_radius: form.crank_radius,
      connecting_rod_length: form.connecting_rod_length,
      offset: form.offset,
      slider_position: sample.slider_position,
      transmission_angle_deg: sample.transmission_angle_deg,
      joint_coordinates: sample.joint_coordinates,
      velocity_analysis: sample.velocity_analysis,
      acceleration_analysis: sample.acceleration_analysis,
      notes: sample.notes,
    };
  }, [form, result, selectedSampleIndex, sweepResult]);
}
