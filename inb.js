#ifndef AREA_3D_H
#define AREA_3D_H

#include "core/templates/vset.h"
#include "scene/3d/collision_object_3d.h"

class Area3D : public CollisionObject3D {
	GDCLASS(Area3D, CollisionObject3D);

public:
	enum SpaceOverride {
		SPACE_OVERRIDE_DISABLED,
		SPACE_OVERRIDE_COMBINE,
		SPACE_OVERRIDE_COMBINE_REPLACE,
		SPACE_OVERRIDE_REPLACE,
		SPACE_OVERRIDE_REPLACE_COMBINE
	};

private:
	SpaceOverride gravity_space_override = SPACE_OVERRIDE_DISABLED;
	Vector3 gravity_vec;
	real_t gravity;
	bool gravity_is_point = false;
	real_t gravity_distance_scale = 0.0;

	SpaceOverride linear_damp_space_override = SPACE_OVERRIDE_DISABLED;
	SpaceOverride angular_damp_space_override = SPACE_OVERRIDE_DISABLED;
	real_t angular_damp = 0.1;
	real_t linear_damp = 0.1;

	int priority = 0;

	real_t wind_force_magnitude = 0.0;
	real_t wind_attenuation_factor = 0.0;
	NodePath wind_source_path;

	bool monitoring = false;
	bool monitorable = false;
	bool locked = false;

	void _body_inout(int p_status, const RID &p_body, ObjectID p_instance, int p_body_shape, int p_area_shape);

	void _body_enter_tree(ObjectID p_id);
	void _body_exit_tree(ObjectID p_id);

	struct ShapePair {
		int body_shape = 0;
		int area_shape = 0;
		bool operator<(const ShapePair &p_sp) const {
			if (body_shape == p_sp.body_shape) {
				return area_shape < p_sp.area_shape;
			} else {
				return body_shape < p_sp.body_shape;
			}
		}

		ShapePair() {}
		ShapePair(int p_bs, int p_as) {
			body_shape = p_bs;
			area_shape = p_as;
		}
	};

	struct BodyState {
		RID rid;
		int rc = 0;
		bool in_tree = false;
		VSet<ShapePair> shapes;
	};

	Map<ObjectID, BodyState> body_map;

	void _area_inout(int p_status, const RID &p_area, ObjectID p_instance, int p_area_shape, int p_self_shape);

	void _area_enter_tree(ObjectID p_id);
	void _area_exit_tree(ObjectID p_id);

	struct AreaShapePair {
		int area_shape = 0;
		int self_shape = 0;
		bool operator<(const AreaShapePair &p_sp) const {
			if (area_shape == p_sp.area_shape) {
				return self_shape < p_sp.self_shape;
			} else {
				return area_shape < p_sp.area_shape;
			}
		}

		AreaShapePair() {}
		AreaShapePair(int p_bs, int p_as) {
			area_shape = p_bs;
			self_shape = p_as;
		}
	};

	struct AreaState {
		RID rid;
		int rc = 0;
		bool in_tree = false;
		VSet<AreaShapePair> shapes;
	};

	Map<ObjectID, AreaState> area_map;
	void _clear_monitoring();

	bool audio_bus_override = false;
	StringName audio_bus = "Master";

	bool use_reverb_bus = false;
	StringName reverb_bus = "Master";
	float reverb_amount = 0.0;
	float reverb_uniformity = 0.0;

	void _validate_property(PropertyInfo &property) const override;

	void _initialize_wind();

protected:
	void _notification(int p_what);
	static void _bind_methods();
