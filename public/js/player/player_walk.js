function is_walking () {
	if (this.cursors.left.isDown || this.cursors.right.isDown)
		return (true);
	return (false);
}

function image_rotate_left (left_dir) {
	x_scale = this.profile_img.scale.x;
	if (left_dir)
	{
		if (this.profile_img.scale.x > 0)
		{
			this.profile_img.position.x += this.correction_pixels;
			this.profile_img.scale.x = -Math.abs(x_scale);
		}
	}
	else
	{
		if (this.profile_img.scale.x < 0)
		{
			this.profile_img.position.x -= this.correction_pixels;
			this.profile_img.scale.x = Math.abs(x_scale);
		}
	}
}

function player_walk (x_vel) {
	this.profile_img.body.velocity.x = x_vel;
	this.rotate_left(x_vel < 0);
}