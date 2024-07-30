import express from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";

export type DatabaseClient = SupabaseClient<Database>;

export type IExpressParams = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => void;
